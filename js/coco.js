/**
 * Created by Yunzhe on 2018/1/3.
 */

'use strict';
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-5, 20, -5);

var renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor("#ffffff");
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

//Create a PointLight and turn on shadows for the light
var light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(5, 10, 5);
light.castShadow = true;            // default false
scene.add(light);
//Set up shadow properties for the light
light.shadow.mapSize.width = 1024;  // default
light.shadow.mapSize.height = 1024; // default
light.shadow.camera.near = 0.5;       // default
light.shadow.camera.far = 500;      // default

var geometry = new THREE.BoxGeometry(2, 0.5, 2);
var loader = new THREE.TextureLoader();
var material = new THREE.MeshBasicMaterial();
material.map = loader.load("image/texture.jpg");
var cube = new THREE.Mesh(geometry, material);
cube.castShadow = true;
cube.receiveShadow = false;
scene.add(cube);

//Create a plane that receives shadows (but does not cast them)
var planeGeometry = new THREE.BoxGeometry(10, 0.1, 10);
var planeMaterial = new THREE.MeshStandardMaterial({color: 0x00ff00});
var plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.position.set(0, -5, 0);
plane.receiveShadow = true;
scene.add(plane);

function animate() {
    requestAnimationFrame(animate);
    // cube.rotateZ(0.1);
    renderer.render(scene, camera);
}

animate();
var tween_0 = TweenLite.to(camera.position, 2, {
    y: 10,
    delay: 1,
    ease: Cubic.easeInOut
});
var rotObjectMatrix;

function rotateAroundObjectAxis(object, axis, radians) {
    rotObjectMatrix = new THREE.Matrix4();
    rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);
    object.matrix.multiply(rotObjectMatrix);
    object.rotation.setFromRotationMatrix(object.matrix);
}

var rotationRadius = {cube_0: 0};
var tween_1 = TweenLite.to(rotationRadius, 2 * 60, {
    cube_0: 4 * 90 / 180 * Math.PI / (2 * 60),
    delay: 60,
    onUpdate: function () {
        cube.rotateZ(rotationRadius.cube_0);
        // rotateAroundObjectAxis(cube, new THREE.Vector3(0, 0, 1), rotationRadius.cube_0);
    },
    ease: Quad.easeInOut,
    useFrames: true
});