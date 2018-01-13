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
let frustumSize = {value: 30};

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

    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.OrthographicCamera(frustumSize.value * aspect / -2, frustumSize.value * aspect / 2, frustumSize.value / 2, frustumSize.value / -2, 1, 2000);
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
        // for (let g of grid) {
        //     if (g._num < 10) {
        //         g.load();
        //     }
        // }
        grid[0].load();
        TweenLite.to(camera, 5, {
            zoom: 2,
            ease: Bounce.easeInOut,
            onUpdate: function () {
                camera.updateProjectionMatrix();
            }
        });
        TweenLite.to(camera.position, 5, {
            x: grid[0]._position.x,
            z: grid[0]._position.z,
            ease: Power0.easeNone
        });
    });
    // grid.push(new Grid(0, new THREE.Vector3(1, 0, 1), 0));
    // grid.push(new Grid(0, new THREE.Vector3(0, 0, 0), 0));

    stats = new Stats();
    container.appendChild(stats.dom);

    // // Init postprocessing
    // initPostprocessing();
    //
    // // Init gui
    // let gui = new dat.GUI();
    // gui.add(postprocessing, 'enabled');
    //
    // gui.add(postprocessing, 'onlyAO', false).onChange(function (value) {
    //     ssaoPass.onlyAO = value;
    // });
    //
    // gui.add(postprocessing, 'radius').min(0).max(64).onChange(function (value) {
    //     ssaoPass.radius = value;
    // });
    //
    // gui.add(postprocessing, 'aoClamp').min(0).max(1).onChange(function (value) {
    //     ssaoPass.aoClamp = value;
    // });
    //
    // gui.add(postprocessing, 'lumInfluence').min(0).max(1).onChange(function (value) {
    //     ssaoPass.lumInfluence = value;
    // });

    document.addEventListener('mousemove', onDocumentMouseMove, false);

    window.addEventListener('resize', onWindowResize, false);

    $("#go").click(function () {
        console.log("Click");
    });
}


function onWindowResize() {

    const width = window.innerWidth;
    const height = window.innerHeight;

    const aspect = width / height;
    camera.left = -frustumSize.value * aspect / 2;
    camera.right = frustumSize.value * aspect / 2;
    camera.top = frustumSize.value / 2;
    camera.bottom = -frustumSize.value / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    //
    // // Resize renderTargets
    // ssaoPass.setSize(width, height);
    //
    // const pixelRatio = renderer.getPixelRatio();
    // const newWidth = Math.floor(width / pixelRatio) || 1;
    // const newHeight = Math.floor(height / pixelRatio) || 1;
    // effectComposer.setSize(newWidth, newHeight);
}

function onDocumentMouseMove(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function initPostprocessing() {

    // Setup render pass
    const renderPass = new THREE.RenderPass(scene, camera);

    // Setup SSAO pass
    ssaoPass = new THREE.SSAOPass(scene, camera);
    ssaoPass.renderToScreen = true;

    // Add pass to effect composer
    effectComposer = new THREE.EffectComposer(renderer);
    effectComposer.addPass(renderPass);
    effectComposer.addPass(ssaoPass);

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
        if (INTERSECTED !== intersects[0].object) {
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