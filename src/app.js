import './app.css';

import qs from 'qs';

function findFileName(url) {
    const lastSlash = url.lastIndexOf('/');
    if (lastSlash > -1) {
        return url.substring(lastSlash + 1);
    }
    return url;
}

const query = qs.parse(location.search, { ignoreQueryPrefix: true });

const src = query.src || '';

document.title = findFileName(src);

import * as Three from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const scene = new Three.Scene();
scene.background = new Three.Color(0xeeeeee);

const camera = new Three.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 5000);

const renderer = new Three.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const hlight = new Three.AmbientLight(0x404040, 1);
scene.add(hlight);

// const directionalLight = new THREE.DirectionalLight(0xffffff, 100);
// directionalLight.position.set(0, 1, 0);
// directionalLight.castShadow = true;
// scene.add(directionalLight);

const light = new Three.PointLight(0xc4c4c4, 1);
light.position.set(0, 300, 500);
scene.add(light);

const light2 = new Three.PointLight(0xc4c4c4, 1);
light2.position.set(500, 100, 0);
scene.add(light2);

const light3 = new Three.PointLight(0xc4c4c4, 1);
light3.position.set(0, 100, -500);
scene.add(light3);

const light4 = new Three.PointLight(0xc4c4c4, 1);
light4.position.set(-500, 300, 500);
scene.add(light4);

const light5 = new Three.PointLight(0xc4c4c4, 1);
light5.position.set(0, 0, 0);
scene.add(light5);

const controls = new OrbitControls(camera, renderer.domElement);

function fitCameraToObject(camera, object, offset, controls) {

    offset = offset || 1.25;

    const boundingBox = new Three.Box3();

    // get bounding box of object - this will be used to setup controls and camera
    boundingBox.setFromObject(object);

    const center = boundingBox.getCenter(new Three.Vector3());

    const size = boundingBox.getSize(new Three.Vector3());

    // get the max side of the bounding box (fits to width OR height as needed )
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 4 * Math.tan(fov * 2));

    cameraZ *= offset; // zoom out a little so that objects don't fill the screen

    camera.position.z = cameraZ;

    const minZ = boundingBox.min.z;
    const cameraToFarEdge = (minZ < 0) ? -minZ + cameraZ : cameraZ - minZ;

    camera.far = cameraToFarEdge * 3;
    camera.updateProjectionMatrix();

    if (controls) {

        // set camera to rotate around center of loaded object
        controls.target = center;

        // prevent camera from zooming out far enough to create far plane cutoff
        controls.maxDistance = cameraToFarEdge * 2;

        controls.saveState();

    } else {

        camera.lookAt(center)

    }
}

function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

const loader = new GLTFLoader();
loader.load(src, function (gltf) {
    const model = gltf.scene.children[0];
    scene.add(gltf.scene);
    fitCameraToObject(camera, model, 1.25, controls);
    animate();
});

window.addEventListener('resize', e => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
}, { passive: true });