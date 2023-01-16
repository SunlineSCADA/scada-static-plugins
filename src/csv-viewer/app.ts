import 'normalize.css';
import './app.css';

import { parse } from 'csv-parse/browser/esm';
import qs from 'qs';

const CELL_LIMIT = 500000;

function findFileName (url: string): string {
    const lastSlash = url.lastIndexOf('/');
    if (lastSlash > -1) {
        return url.substring(lastSlash + 1);
    }
    return url;
}

async function main () {
    const message_el = document.querySelector('.message');
    const table_el = document.querySelector('.main-table');
    const rows: string[] = [];
    let cell_count = 0;
    let is_full_content = true;
    try {
        if (!message_el || !table_el) {
            throw new Error('Elements not found');
        }
        const { src } = qs.parse(location.search, { ignoreQueryPrefix: true }) as { [key: string]: string };
        if (!src) {
            throw new Error('No src provided');
        }
        document.title = findFileName(src);

        const response = await fetch(src);
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        if (!response.body) {
            throw new Error('Response body is null');
        }
        const reader = response.body.getReader();

        const parser = parse({
            delimiter: ';',
            bom: true,
            relax_column_count: true,
        });
        parser.on('data', (row: string[]) => {
            cell_count += row.length;
            rows.push('<tr><td>' + row.join('</td><td>') + '</td></tr>');
        });
        parser.on('end', () => {
            table_el.innerHTML = rows.join('');
            message_el.innerHTML = is_full_content ? '' : `Отображены первые ${rows.length} строк`;
        });
        parser.on('error', err => {
            reader.cancel();
            throw err;
        });

        let result = await reader.read();
        while (!result.done && cell_count < CELL_LIMIT) {
            parser.write(result.value);
            result = await reader.read();
        }
        is_full_content = result.done;
        reader.cancel();
        parser.end();
    } catch (err) {
        console.error(err);
        if (message_el) {
            message_el.innerHTML = 'Ошибка при загрузке';
        }
    }
}

main();