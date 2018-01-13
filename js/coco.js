/**
 * Created by Yunzhe on 2018/1/3.
 */

'use strict';
if (!Detector.webgl) Detector.addGetWebGLMessage();

var container, stats;
var camera, scene, raycaster, renderer;
var mouse = new THREE.Vector2(), INTERSECTED;
var effectComposer;
var ssaoPass;
var grid = [];
var postprocessing = {enabled: true, onlyAO: false, radius: 5, aoClamp: 0.2, lumInfluence: 0.28};

init();
animate();

function init() {

    container = document.createElement('div');
    document.body.appendChild(container);

    raycaster = new THREE.Raycaster();

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 20, 0);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeeeeee);

    // Create a plane that receives shadows (but does not cast them)
    var planeGeometry = new THREE.BoxGeometry(1000, 0.1, 1000);
    var planeMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.name = "Ground";
    scene.add(plane);

    grid.push(new Grid(0, new THREE.Vector3(1, 0, 1), 0));
    grid.push(new Grid(0, new THREE.Vector3(0, 0, 0), 0));
    for (let g of grid) {
        g.load();
    }
    TweenLite.to(camera.position, 2, {
        y: 5,
        ease: Cubic.easeInOut,
        onComplete: function () {
            for (let g of grid) {
                g.show();
            }
        }
    });

    stats = new Stats();
    container.appendChild(stats.dom);

    // Init postprocessing
    initPostprocessing();

    // Init gui
    var gui = new dat.GUI();
    gui.add(postprocessing, 'enabled');

    gui.add(postprocessing, 'onlyAO', false).onChange(function (value) {
        ssaoPass.onlyAO = value;
    });

    gui.add(postprocessing, 'radius').min(0).max(64).onChange(function (value) {
        ssaoPass.radius = value;
    });

    gui.add(postprocessing, 'aoClamp').min(0).max(1).onChange(function (value) {
        ssaoPass.aoClamp = value;
    });

    gui.add(postprocessing, 'lumInfluence').min(0).max(1).onChange(function (value) {
        ssaoPass.lumInfluence = value;
    });

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );

    window.addEventListener('resize', onWindowResize, false);

}


function onWindowResize() {

    var width = window.innerWidth;
    var height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);

    // Resize renderTargets
    ssaoPass.setSize(width, height);

    var pixelRatio = renderer.getPixelRatio();
    var newWidth = Math.floor(width / pixelRatio) || 1;
    var newHeight = Math.floor(height / pixelRatio) || 1;
    effectComposer.setSize(newWidth, newHeight);
}

function onDocumentMouseMove( event ) {
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function initPostprocessing() {

    // Setup render pass
    var renderPass = new THREE.RenderPass(scene, camera);

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

function render() {
    if (postprocessing.enabled) {
        // find intersections
        raycaster.setFromCamera( mouse, camera );
        var objects = scene.children.slice(1);
        var intersects = raycaster.intersectObjects(objects);
        if ( intersects.length > 0 ) {
            if ( INTERSECTED !== intersects[ 0 ].object ) {
                if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
                INTERSECTED = intersects[ 0 ].object;
                INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
                INTERSECTED.material.color.setHex( 0xff0000 );
            }
        } else {
            if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
            INTERSECTED = null;
        }
        effectComposer.render();
    } else {
        renderer.render(scene, camera);
    }
}