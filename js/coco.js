/**
 * Created by Yunzhe on 2018/1/3.
 */

'use strict';
if (!Detector.webgl) Detector.addGetWebGLMessage();

let container, stats;
let camera, scene, raycaster, renderer;
let mouse = new THREE.Vector2(), INTERSECTED;
let effectComposer;
let ssaoPass;
let grid = [];
let postprocessing = {enabled: false, onlyAO: false, radius: 5, aoClamp: 0.2, lumInfluence: 0.28};
let current = 1;
let status = -1;
let frustumSize = {value: 30};
const dice = new Dice();

init();
animate();

function init() {
    container = document.createElement('div');
    document.body.appendChild(container);

    raycaster = new THREE.Raycaster();

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 20, 0);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeeeeee);

    // Grid
    const gridHelper = new THREE.GridHelper(100, 100);
    grid.name = "Ground";
    scene.add(gridHelper);

    $.getJSON("data/map.json", function (result) {
        $.each(result, function (i, tuple) {
            grid.push(new Grid(tuple.num, new THREE.Vector3(tuple.x * 1.5 - 15, tuple.y + 0.4, tuple.z * 1.5 - 16.5), tuple.type, tuple.event));
        });
    });

    stats = new Stats();
    container.appendChild(stats.dom);

    document.addEventListener('mousemove', onDocumentMouseMove, false);

    window.addEventListener('resize', onWindowResize, false);

    $("#go").click(function () {
        console.log("Click");
        if (status === -1) {
            grid[current - 1].show();
            TweenLite.to(camera.position, 5, {
                y: 10,
                ease: Bounce.easeInOut,
            });
            TweenLite.to(camera.position, 5, {
                x: grid[current - 1]._position.x,
                z: grid[current - 1]._position.z,
                ease: Power0.easeNone
            });
            status = 0;
        } else if (status === 0) {
            TweenLite.to(camera.position, 2, {
                y: 20,
                ease: Back.easeOut,
                onUpdate: function () {
                    camera.updateProjectionMatrix();
                },
                onComplete: function () {
                    dice.rotateTo(6);
                }
            });
            TweenLite.to(camera.position, 2, {
                x: 0,
                z: 0,
                ease: Back.easeOut,
            });
            status = 1;
        } else if (status === 1) {
            current += 1;
            grid[current - 1].show();
            TweenLite.to(camera.position, 2, {
                y: 10,
                ease: Bounce.easeOut,
            });
            TweenLite.to(camera.position, 2, {
                x: grid[current - 1]._position.x,
                z: grid[current - 1]._position.z,
                ease: Power0.easeNone
            });
            status = 0;
        }
    });
}


function onWindowResize() {

    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

function onDocumentMouseMove(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function animate() {
    requestAnimationFrame(animate);
    render();
    stats.update();
}

function intersect() {
    // find intersections
    raycaster.setFromCamera(mouse, camera);
    const objects = scene.children.slice(1);
    const intersects = raycaster.intersectObjects(objects);
    if (intersects.length > 0) {
        if (INTERSECTED !== intersects[0].object && intersects[0].object.name !== "Ground") {
            if (INTERSECTED) INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
            INTERSECTED = intersects[0].object;
            INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
            INTERSECTED.material.color.setHex(0xff0000);
        }
    } else {
        if (INTERSECTED) INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
        INTERSECTED = null;
    }
}

function render() {
    intersect();
    // if (postprocessing.enabled) {
    //     effectComposer.render();
    // } else {
    renderer.render(scene, camera);
    // }
}