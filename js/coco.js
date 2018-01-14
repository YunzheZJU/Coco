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
let event = [];
let postprocessing = {enabled: false, onlyAO: false, radius: 5, aoClamp: 0.2, lumInfluence: 0.28};
let currentEvent = 1;
let numOfGridsOpened = 1;
let status = -1;
let frustumSize = {value: 30};
let selectable = true;
let currentProgress = {number: 0};
let relatedNumber = 0;
const dice = new Dice();
const $percent = $("#percent");
const COLOR = [0xee3b24, 0xf99e1a, 0xef519e, 0x2497cb];

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
    scene.fog = new THREE.Fog(0xf0f0f0, 19, 20);

    // Grid
    const gridHelper = new THREE.GridHelper(100, 100);
    scene.add(gridHelper);

    $.getJSON("data/map.json", function (result) {
        $.each(result, function (i, tuple) {
            grid.push(new Grid(tuple.num, new THREE.Vector3(tuple.x * 1.5 - 15, tuple.y + 0.4, tuple.z * 1.5 - 16.5), tuple.type, tuple.event));
        });
    });
    $.getJSON("data/event.json", function (result) {
        $.each(result, function (i, tuple) {
            event.push({
                event: tuple.event,
                number: tuple.number,
                progress: tuple.progress,
                location: tuple.location,
                character: tuple.character,
                description: tuple.description,
                choice_1: tuple.choice_1,
                choice_2: tuple.choice_2,
                result: tuple.result,
                related: tuple.related
            });
        })
    });

    stats = new Stats();
    container.appendChild(stats.dom);

    document.addEventListener('mousemove', onDocumentMouseMove, false);

    window.addEventListener('resize', onWindowResize, false);
    //
    // const curve = new THREE.SplineCurve([
    //     new THREE.Vector2(1, 2),
    //     new THREE.Vector2(0, 0),
    //     new THREE.Vector2(-2, -1)
    // ]);
    // const points = curve.getPoints(50);
    // const geometry = new THREE.BufferGeometry().setFromPoints(points);
    //
    // const material = new THREE.LineBasicMaterial({color: 0xff0000});
    //
    // // Create the final object to add to the scene
    // const splineObject = new THREE.Line(geometry, material);
    // // splineObject.rotation.x = Math.PI / 2;
    // splineObject.position.y = 2;
    // scene.add(splineObject);

    $go.click(function () {
        if (status === -1) {
            grid[0].show(0);
            currentEvent = 1;
            numOfGridsOpened = 1;
            TweenLite.to(scene.fog, 3, {
                near: 11,
                far: 12,
                ease: Bounce.easeInOut
            });
            TweenLite.to(camera.position, 3, {
                y: 10,
                ease: Bounce.easeInOut
            });
            TweenLite.to(camera.position, 3, {
                x: grid[currentEvent - 1].position.x,
                z: grid[currentEvent - 1].position.z,
                ease: Power0.easeNone
            });
            status = 0;
        } else if (status === 0) {
            $go.attr('disabled', true);
            selectable = false;
            dice.rotateTo(event[currentEvent - 1].number);
            status = 1;
        } else if (status === 1) {
            for (let i = numOfGridsOpened; i < numOfGridsOpened + event[currentEvent - 1].number; i++) {
                grid[i].show((i - numOfGridsOpened) * 0.4);
            }
            numOfGridsOpened += event[currentEvent - 1].number;
            currentEvent += 1;
            TweenLite.to(camera.position, 2, {
                y: 10,
                delay: 1,
                ease: Back.easeInOut
            });
            TweenLite.to(camera.position, 2, {
                x: grid[numOfGridsOpened - 1].position.x,
                z: grid[numOfGridsOpened - 1].position.z,
                delay: 1,
                ease: Power2.easeInOut,
                onComplete: function () {
                    ////////////////Read the story//////////////////////

                    ///////////After reading the story//////////////////
                    if (event[currentEvent - 1].related !== 0) {
                        relatedNumber = event[currentEvent - 1].related;

                        const curve = new THREE.SplineCurve([
                            new THREE.Vector2(grid[numOfGridsOpened - 1].position.x, grid[numOfGridsOpened - 1].position.z),
                            new THREE.Vector2(grid[numOfGridsOpened - 1].position.x + 5, grid[numOfGridsOpened - 1].position.z),
                            new THREE.Vector2(grid[relatedNumber].position.x - 5, grid[relatedNumber].position.z),
                            new THREE.Vector2(grid[relatedNumber].position.x, grid[relatedNumber].position.z)
                        ]);
                        const points = curve.getPoints(100);
                        const geometry = new THREE.Geometry();
                        for (let i = 0; i < points.length; i++) {
                            geometry.vertices[i] = points[i];
                        }
                        geometry.computeLineDistances();
                        const material = new THREE.LineDashedMaterial({
                            color: COLOR[parseInt(Math.random() * 4)],
                            linewidth: 20,
                            scale: 1,
                            dashSize: 2,
                            gapSize: 2,
                        });
                        // Create the final object to add to the scene
                        const splineObject = new THREE.Line(geometry, material);
                        splineObject.rotation.x = Math.PI / 2;
                        splineObject.position.y = 0.2;
                        scene.add(splineObject);

                        // Move the camera
                        TweenLite.to(camera.position, 2, {
                            y: 12,
                            ease: Sine.easeOut,
                            onComplete: function () {
                                TweenLite.to(camera.position, 2, {
                                    y: 10,
                                    ease: Sine.easeIn
                                })
                            }
                        });
                        // TweenLite.to(scene.fog)
                        TweenLite.to(camera.position, 4, {
                            x: grid[relatedNumber].position.x,
                            y: 10,
                            z: grid[relatedNumber].position.z,
                            delay: 2,
                            onComplete: function () {
                                grid[relatedNumber].popup();
                            }
                        });
                    }
                    TweenLite.to(currentProgress, 2, {
                        number: event[currentEvent].progress,
                        onUpdate: function () {
                            $percent[0].innerHTML = currentProgress.number.toFixed(0);
                        }
                    });
                    if (currentEvent !== 49) {
                        status = 0;
                    } else {
                        status = 2;
                    }
                }
            });
        } else if (status === 2) {
            console.log("You win!");
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
        if (INTERSECTED !== intersects[0].object && intersects[0].object.name === "Selectable" && selectable) {
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
    renderer.render(scene, camera);
}