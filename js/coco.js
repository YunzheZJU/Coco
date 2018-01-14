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
let isdragging = false;
let currentProgress = {number: 0};
let relatedNumber = 0;
let clickCount = parseInt(4 * Math.random());
let focus = null;
let focusDown = null;
let focusUp = null;
// let bReadStory = true;
let readStory = {ReadStory: true};
const dice = new Dice();
const $percent = $("#percent");
const $circle = $("#circle");
const $click = $(".click");
const COLOR_HEX = [0xee3b24, 0xf99e1a, 0xef519e, 0x2497cb];
const COLOR_STRING = ["#ee3b24", "#f99e1a", "#ef519e", "#2497cb"];

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

    // Init gui
    const gui = new dat.GUI();
    gui.domElement.id = 'gui';
    gui.add(readStory, 'ReadStory');

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

    document.addEventListener('wheel', onDocumentWheel, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);
    document.addEventListener('mousedown', onDocumentMouseDown, false);

    window.addEventListener('resize', onWindowResize, false);

    $click.click(function () {
        clickCount++;
        $circle.css('background-color', COLOR_STRING[clickCount % 4]);
        if (clickCount > 20) {
            console.log("20202002020202");
        }
    });
    $click.click();

    $go.click(function () {
        if (status === -1) {
            $go.attr('disabled', true);
            $go[0].innerHTML = "↓";
            grid[0].show(0);
            currentEvent = 1;
            numOfGridsOpened = 1;
            TweenLite.to(scene.fog, 3, {
                near: 11,
                far: 22,
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
            if (currentEvent !== 49) {
                TweenLite.to(camera.position, event[currentEvent - 2].number * 0.4 + 2.1, {
                    y: 10,
                    delay: 1,
                    ease: Back.easeInOut
                });
                TweenLite.to(camera.position, event[currentEvent - 2].number * 0.4 + 2.1, {
                    x: grid[numOfGridsOpened - 1].position.x,
                    z: grid[numOfGridsOpened - 1].position.z,
                    delay: 1,
                    ease: Power2.easeInOut,
                    onComplete: function () {
                        ////////////////Read the story//////////////////////
                        if (readStory.ReadStory) {
                            grid[numOfGridsOpened - 1].fetch();
                        } else {
                            onBack();
                        }
                    }
                });
                status = 0;
            } else {
                status = 2;
            }
        } else if (status === 2) {
            TweenLite.to(camera.position, 4, {
                y: 20,
                ease: Back.easeInOut
            });
            TweenLite.to(camera.position, 4, {
                x: 0,
                z: 0
            });
            TweenLite.to(scene.fog, 3, {
                near: 21,
                far: 22
            });
            console.log("You win!");
        }
    });
}

function onBack() {
    selectable = true;
    $go.removeAttr("disabled");
    ///////////After reading the story//////////////////
    if (event[currentEvent - 1].related !== 0) {
        relatedNumber = event[currentEvent - 1].related;

        const curve = new THREE.SplineCurve([
            new THREE.Vector2(grid[numOfGridsOpened - 1].position.x, grid[numOfGridsOpened - 1].position.z),
            new THREE.Vector2(grid[numOfGridsOpened - 1].position.x - 1, grid[numOfGridsOpened - 1].position.z - 2),
            new THREE.Vector2(grid[relatedNumber].position.x + 1, grid[relatedNumber].position.z + 2),
            new THREE.Vector2(grid[relatedNumber].position.x, grid[relatedNumber].position.z)
        ]);
        const points = curve.getPoints(100);
        const geometry = new THREE.Geometry().setFromPoints(points);
        geometry.computeLineDistances();
        const material = new THREE.LineDashedMaterial({
            color: COLOR_HEX[parseInt(Math.random() * 4)],
            linewidth: 2,
            scale: 1,
            dashSize: 0.2,
            gapSize: 0.2,
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
}

function onWindowResize() {

    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

function onDocumentWheel(event) {
    camera.position.y *= (event.wheelDelta > 0 ? 0.9 : 1.1);
}

function onDocumentMouseDown(event) {
    isdragging = true;
    focusDown = focus;
    // console.log("Mouse down: " + focusDown);
}

function onDocumentMouseUp(event) {
    isdragging = false;
    if (focusDown && (focus === focusDown)) {
        const number = parseInt(focus);
        grid[number - 1].fetch();
    }
    // console.log("Mouse Up: " + focus);
}

function onDocumentMouseMove(event) {
    event.preventDefault();
    focusDown = null;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    if (isdragging) {
        camera.position.x -= event.movementX / 50;
        camera.position.z -= event.movementY / 50;
    }
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
    focus = null;
    if (intersects.length > 0) {
        if (INTERSECTED !== intersects[0].object && intersects[0].object.name.slice(0, 5) === "Event" && selectable) {
            if (INTERSECTED) INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
            // Save the color of the object
            INTERSECTED = intersects[0].object;
            INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
            INTERSECTED.material.color.setHex(0xff0000);
        }
        focus = intersects[0].object.name.slice(6);
    } else {
        // Return the color to the object
        if (INTERSECTED) INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
        INTERSECTED = null;
    }
}

function render() {
    intersect();
    renderer.render(scene, camera);
}