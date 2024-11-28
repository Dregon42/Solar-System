import * as THREE from 'three';
import GUI from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { getFresnelMat } from './getFresnelMat';
import getStarfield from './getStarfield';

// GUI
const gui = new GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene();

// Light
const ambientLight = new THREE.AmbientLight(0xffffff, .8);
scene.add(ambientLight);

// Directional light
const pointLight = new THREE.PointLight(0xffffff, 100)
scene.add(pointLight)

// axesHelper
const axelHelper = new THREE.AxesHelper(10);
scene.add(axelHelper)


/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

const earthColorTexture = textureLoader.load('./textures/00_earthmap1k.jpg');
const earthSpecularTexture = textureLoader.load("./textures/02_earthspec1k.jpg");
const earthBumpTexture = textureLoader.load("./textures/01_earthbump1k.jpg");
const earthNightLights = textureLoader.load('./textures/03_earthlights1k.jpg');
const earthClouds = textureLoader.load('./textures/04_earthcloudmap.jpg');
const earthAlphaCloud = textureLoader.load('./textures/05_earthcloudmaptrans.jpg');

const marsColorTexture = textureLoader.load('./textures/marsmap1k.jpg');
const marsBumpTexture = textureLoader.load('./textures/marsbump1k.jpg');

const sunColorTexture = textureLoader.load('./textures/sunmap.jpg');

earthColorTexture.colorSpace = THREE.SRGBColorSpace;
sunColorTexture.colorSpace = THREE.SRGBColorSpace;

/**
 * Objects
 */

// Stars
const stars = getStarfield({numStars: 2000});
scene.add(stars);

const detail = 12;
const sphereGeometry = new THREE.IcosahedronGeometry(1, detail);

// Sun
const sunMaterial = new THREE.MeshPhongMaterial({ 
    // color: '0xFFFF00',
    map: sunColorTexture,
})
const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial); 
scene.add(sunMesh);

gui.add(sunMaterial, 'wireframe' );

// Earth Group
const earthGroup = new THREE.Group();
earthGroup.rotation.z = 60.45 * Math.PI / 180;
scene.add(earthGroup);
earthGroup.position.set(3, 3, 3)


// Earth
const earthMaterial = new THREE.MeshPhongMaterial({ 
    // color: 0xffffff,
    map: earthColorTexture,
    specularMap: earthSpecularTexture,
    bumpMap: earthBumpTexture
});
const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);
earthGroup.add(earthMesh);

const nightLights = new THREE.MeshBasicMaterial({
    map: earthNightLights,
    blending: THREE.AdditiveBlending,
})
const nightLightsMesh = new THREE.Mesh(sphereGeometry, nightLights);
earthGroup.add(nightLightsMesh);

const clouds = new THREE.MeshStandardMaterial({
    map: earthClouds,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    alphaMap: earthAlphaCloud,
    alphaTest: 0.3,
});
const cloudsMesh = new THREE.Mesh(sphereGeometry, clouds);
cloudsMesh.scale.setScalar(1.003);
earthGroup.add(cloudsMesh);

const fresnelMat = getFresnelMat();
const glowMesh = new THREE.Mesh(sphereGeometry, fresnelMat);
glowMesh.scale.setScalar(1.01);
earthGroup.add(glowMesh);



// Mars
const marshMaterial = new THREE.MeshPhongMaterial({ 
    // color: 0xffffff,
    map: marsColorTexture,
    bumpMap: marsBumpTexture
});
const marsMesh = new THREE.Mesh(sphereGeometry, marshMaterial);
marsMesh.position.set(6, 6, 3);
scene.add(marsMesh);

// 



/**
 * Sizes
 */
const sizes = {
    width: innerWidth,
    height: innerHeight
}

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, .01, 100)
camera.position.z = 10
camera.lookAt(earthGroup);
scene.add(camera);

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
})

/**
 * Controls
 */
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera);

// Animate
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    earthMesh.rotation.y += 0.002;
    nightLightsMesh.rotation.y += 0.002;
    cloudsMesh.rotation.y += 0.0023;
    // glowMesh.rotation.y += 0.002;
    // stars.rotation.y -= 0.0002;

    // Controls update
    controls.update(); 

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);


};

tick();