/**
 * Created by Yunzhe on 2018/1/3.
 */

'use strict';
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats;
var camera, scene, renderer;
var effectComposer;
var ssaoPass;
var group;

var postprocessing = { enabled: true, onlyAO: false, radius: 32, aoClamp: 0.25, lumInfluence: 0.7 };

init();
animate();

function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer( { antialias: false } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 100, 700 );
    camera.position.z = 500;

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xa0a0a0 );

    group = new THREE.Object3D();
    scene.add( group );

    var geometry = new THREE.BoxGeometry( 10, 10, 10 );
    for ( var i = 0; i < 200; i ++ ) {

        var material = new THREE.MeshBasicMaterial();
        material.color.r = Math.random();
        material.color.g = Math.random();
        material.color.b = Math.random();

        var mesh = new THREE.Mesh( geometry, material );
        mesh.position.x = Math.random() * 400 - 200;
        mesh.position.y = Math.random() * 400 - 200;
        mesh.position.z = Math.random() * 400 - 200;
        mesh.rotation.x = Math.random();
        mesh.rotation.y = Math.random();
        mesh.rotation.z = Math.random();

        mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 10 + 1;
        group.add( mesh );

    }

    stats = new Stats();
    container.appendChild( stats.dom );

    // Init postprocessing
    initPostprocessing();

    // Init gui
    var gui = new dat.GUI();
    gui.add( postprocessing, 'enabled' );

    gui.add( postprocessing, 'onlyAO', false ).onChange( function( value ) { ssaoPass.onlyAO = value; } );

    gui.add( postprocessing, 'radius' ).min( 0 ).max( 64 ).onChange( function( value ) { ssaoPass.radius = value; } );

    gui.add( postprocessing, 'aoClamp' ).min( 0 ).max( 1 ).onChange( function( value ) { ssaoPass.aoClamp = value; } );

    gui.add( postprocessing, 'lumInfluence' ).min( 0 ).max( 1 ).onChange( function( value ) { ssaoPass.lumInfluence = value; } );


    window.addEventListener( 'resize', onWindowResize, false );

    onWindowResize();

}


function onWindowResize() {

    var width = window.innerWidth;
    var height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize( width, height );

    // Resize renderTargets
    ssaoPass.setSize( width, height );

    var pixelRatio = renderer.getPixelRatio();
    var newWidth  = Math.floor( width / pixelRatio ) || 1;
    var newHeight = Math.floor( height / pixelRatio ) || 1;
    effectComposer.setSize( newWidth, newHeight );
}

function initPostprocessing() {

    // Setup render pass
    var renderPass = new THREE.RenderPass( scene, camera );

    // Setup SSAO pass
    ssaoPass = new THREE.SSAOPass( scene, camera );
    ssaoPass.renderToScreen = true;

    // Add pass to effect composer
    effectComposer = new THREE.EffectComposer( renderer );
    effectComposer.addPass( renderPass );
    effectComposer.addPass( ssaoPass );

}

function animate() {

    requestAnimationFrame( animate );

    stats.begin();
    render();
    stats.end();

}

function render() {

    var timer = performance.now();
    group.rotation.x = timer * 0.0002;
    group.rotation.y = timer * 0.0001;

    if ( postprocessing.enabled ) {

        effectComposer.render();

    } else {

        renderer.render( scene, camera );

    }

}

// var scene = new THREE.Scene();
// var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// camera.position.set(0, 20, 0);
//
// var renderer = new THREE.WebGLRenderer({
//     antialias: true
// });
// renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.setClearColor("#ffffff");
// // renderer.shadowMap.enabled = true;
// // renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// document.body.appendChild(renderer.domElement);
//
// // //Create a PointLight and turn on shadows for the light
// // var light = new THREE.PointLight(0xffffff, 1, 100);
// // light.position.set(5, 10, 5);
// // light.castShadow = true;            // default false
// // scene.add(light);
// // //Set up shadow properties for the light
// // light.shadow.mapSize.width = 1024;  // default
// // light.shadow.mapSize.height = 1024; // default
// // light.shadow.camera.near = 0.5;       // default
// // light.shadow.camera.far = 500;      // default
//
// // var geometry = new THREE.BoxGeometry(2, 0.5, 2);
// // var loader = new THREE.TextureLoader();
// // var material = new THREE.MeshStandardMaterial();
// // material.map = loader.load("image/texture.jpg");
// var loader = new THREE.OBJLoader();
// var cube;
// loader.load("model/test.obj", function (group) {
//     var loader = new THREE.TextureLoader();
//     var material = new THREE.MeshBasicMaterial();
//     material.map = loader.load( 'image/gridTexture.bmp' );
//     material.map.wrapS = THREE.RepeatWrapping;
//     group.traverse( function ( child ) {
//         if ( child instanceof THREE.Mesh ) {
//             child.material = material;
//         }
//     } );
//     cube = group;
//     // object.material = material;
//     // group.position.x = - 0.45;
//     // group.rotation.y = - 0.45;
//     scene.add(group);
//     TweenLite.to(cube.rotation, 2, {
//         z: -Math.PI * 1.1,
//         delay: 1,
//         ease: Quad.easeInOut,
//         onComplete: function () {
//             TweenLite.to(cube.rotation, 0.4, {
//                 z: -Math.PI * 0.9,
//                 onComplete: function () {
//                     TweenLite.to(cube.rotation, 0.2, {
//                         z: -Math.PI * 1.05,
//                         onComplete: function () {
//                             TweenLite.to(cube.rotation, 0.1, {
//                                 z: -Math.PI
//                             });
//                         }
//                     });
//                 }
//             });
//         }
//     });
// });
// // var cube = new THREE.Mesh(geometry, material);
// // // cube.castShadow = true;
// // // cube.receiveShadow = false;
// // scene.add(cube);
//
// // //Create a plane that receives shadows (but does not cast them)
// // var planeGeometry = new THREE.BoxGeometry(10, 0.1, 10);
// // var planeMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00});
// // var plane = new THREE.Mesh(planeGeometry, planeMaterial);
// // // plane.position.set(0, -5, 0);
// // // plane.receiveShadow = true;
// // scene.add(plane);
//
// function animate() {
//     requestAnimationFrame(animate);
//     // cube.rotateZ(0.1);
//     renderer.render(scene, camera);
// }
//
// animate();
// var tween_0 = TweenLite.to(camera.position, 2, {
//     y: 10,
//     delay: 1,
//     ease: Cubic.easeInOut
// });
// var rotObjectMatrix;
//
// function rotateAroundObjectAxis(object, axis, radians) {
//     rotObjectMatrix = new THREE.Matrix4();
//     rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);
//     object.matrix.multiply(rotObjectMatrix);
//     object.rotation.setFromRotationMatrix(object.matrix);
// }
//
// var rotationRadius = {cube_0: 0.1};
// // var tween_1 = TweenLite.to(rotationRadius, 2 * 60, {
// //     cube_0: -4 * 90 / 180 * Math.PI / (2 * 60),
// //     delay: 60,
// //     onUpdate: function () {
// //         cube.rotateZ(rotationRadius.cube_0);
// //         // rotateAroundObjectAxis(cube, new THREE.Vector3(0, 0, 1), rotationRadius.cube_0);
// //     },
// //     ease: Quad.easeInOut,
// //     useFrames: true
// // });
