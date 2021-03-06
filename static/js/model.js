/**
 * Created by Yunzhe on 2018/1/12.
 */

'use strict';
const $go = $("#go");
const $image = $("#image");
const $video = $("#video");
const imgPosition = {value: -500};

class Grid {
    constructor(num, position, type, event) {
        this._cube = null;
        this._isRotated = false;
        this._isShown = false;
        this._material = new THREE.MeshBasicMaterial();
        this._num = num;
        this._position = position;
        this._type = type;
        this._event = event;

        const loader = new THREE.TextureLoader();
        this._material.map = loader.load('static/image/GridTexture_' + type + '_' + (num > 43 && num < 130 ? '2' : '1') + '.jpg');
        this._material.map.wrapS = THREE.RepeatWrapping;

        this.load();
    }

    setCube(child) {
        if (child instanceof THREE.Mesh) {
            child.material = this._material;
            child.position.z = this._position.z;
            child.position.x = this._position.x;
            child.position.y = this._position.y;
            child.scale.x = 0.01;
            child.scale.z = 0.01;
            child.scale.y = 0.01;
            if (this._type !== 1) {
                child.name = "Event_" + this._num;
            }
            this._cube = child;
        }
        console.log("Loading OK: " + this._num);
    };

    setGroup(group) {
        group.traverse($.proxy(this.setCube, this));
    }

    load() {
        const loader = new THREE.OBJLoader();
        loader.load("static/model/grid.obj", $.proxy(this.setGroup, this));
    }

    show(delay) {
        if (!this._isShown) {
            scene.add(this._cube);
            this._isShown = true;
        }
        TweenLite.to(this._cube.scale, 1 + 0.2 * (Math.random() - 0.5), {
            x: 1.25,
            y: 1,
            z: 1.25,
            delay: delay,
            ease: Elastic.easeOut,
            onComplete: $.proxy(this.rotate, this)
        });
    }

    popup() {
        if (!this._isShown) {
            scene.add(this._cube);
            this._isShown = true;
        }
        TweenLite.to(this._cube.scale, 1 + 0.2 * (Math.random() - 0.5), {
            x: 1.25,
            y: 1,
            z: 1.25,
            ease: Elastic.easeOut,
            onComplete: $.proxy(function () {
                this.spin();
                TweenLite.to(camera.position, 2, {
                    y: 10,
                    delay: 1.75,
                    ease: Back.easeInOut
                });
                TweenLite.to(camera.position, 2, {
                    x: grid[numOfGridsOpened - 1].position.x,
                    z: grid[numOfGridsOpened - 1].position.z,
                    delay: 1.75,
                    ease: Power2.easeInOut,
                    onComplete: function () {
                        selectable = true;
                        $go.removeAttr("disabled");
                    }
                });
            }, this)
        });
    }

    spin() {
        TweenLite.to(this._cube.rotation, 2, {
            y: 2 * Math.PI,
            ease: Power0.easeNone,
            onComplete: $.proxy(function () {
                this._cube.rotation.y = 0;
            }, this)
        })
    }

    rotate() {
        if (!this._isRotated) {
            TweenLite.to(this._cube.rotation, 2, {
                z: -Math.PI,
                ease: Bounce.easeOut
            });
            this._isRotated = true;
        } else {
            this.spin();
        }
    }

    freeRotatingYZ() {
        if (this._switch) {
            this._cube.rotation.y += 0.01;
            this._cube.rotation.z -= 0.01;
            requestAnimationFrame($.proxy(this.freeRotatingYZ, this));
        }
    }

    fetch() {
        if (this._isRotated) {
            selectable = false;
            $go.attr('disabled', true);
            TweenLite.to(scene.fog, 1, {
                near: 3,
                far: 10,
            });
            TweenLite.to(this._cube.position, 1, {
                x: camera.position.x - 1.5,
                y: camera.position.y - 3,
                z: camera.position.z
            });
            TweenLite.to(this._cube.rotation, 1, {
                x: Math.PI / 4 * 3
            });
            this._switch = true;
            this.freeRotatingYZ();
            let eventNumber;
            if (this._event < 8.4) {
                eventNumber = this._event - 1;
            } else if (this._event > 8.5 && this._event < 43) {
                eventNumber = this._event;
            } else if (this._event > 44) {
                eventNumber = this._event - 2;
            } else {
                eventNumber = 8;
            }
            board.show(eventNumber + 1);
            TweenLite.to(imgPosition, 2, {
                value: 0,
                ease: Bounce.easeOut,
                onStart: function () {
                    $("#img")[0].src = "static/image/Still_" + currentEvent + ".jpg";
                    $("#vid")[0].src = "static/image/Still_" + (currentEvent + 1) + ".jpg";
                },
                onUpdate: function () {
                    $image[0].style.top = parseInt(imgPosition.value) + "px";
                    $video[0].style.top = parseInt(imgPosition.value) + "px";
                }
            });
        }
    }

    back() {
        this._switch = false;
        TweenLite.to(scene.fog, 0.75, {
            near: 11,
            far: 22,
            ease: Power4.easeIn
        });
        TweenLite.to(this._cube.position, 1, {
            x: this._position.x,
            y: this._position.y,
            z: this._position.z,
        });
        const r_y = this._cube.rotation.y;
        const r_z = this._cube.rotation.z;
        TweenLite.to(this._cube.rotation, 1, {
            x: 0,
            y: parseInt(r_y / 2 / (Math.PI)) * 2 * Math.PI,
            z: parseInt(r_z / 2 / (Math.PI)) * 2 * Math.PI + Math.PI,
            onComplete: onBack
        });
        TweenLite.to(imgPosition, 2, {
            value: -500,
            // ease: Bounce.easeOut,
            onUpdate: function () {
                $image[0].style.top = parseInt(imgPosition.value) + "px";
                $video[0].style.top = parseInt(imgPosition.value) + "px";
            }
        });
    }

    get num() {
        return this._num;
    }

    set num(value) {
        this._num = value;
    }

    get position() {
        return this._position;
    }

    set position(value) {
        this._position = value;
    }

    get type() {
        return this._type;
    }

    set type(value) {
        this._type = value;
    }

    get cube() {
        return this._cube;
    }

    set cube(value) {
        this._cube = value;
    }

    get isRotated() {
        return this._isRotated;
    }

    set isRotated(value) {
        this._isRotated = value;
    }

    get material() {
        return this._material;
    }

    set material(value) {
        this._material = value;
    }

    get event() {
        return this._event;
    }

    set event(value) {
        this._event = value;
    }

    get isShown() {
        return this._isShown;
    }

    set isShown(value) {
        this._isShown = value;
    }
}

class Dice {
    constructor() {
        this._dice = null;
        this._material = new THREE.MeshBasicMaterial();
        this._isFirst = true;
        this._position = null;
        this._next = 6;

        const loader = new THREE.TextureLoader();
        this._material.map = loader.load('static/image/DiceTexture.jpg');
        this._material.transparent = true;
        this._material.map.wrapS = THREE.RepeatWrapping;

        this.load();
    }

    setDice(child) {
        if (child instanceof THREE.Mesh) {
            child.material = this._material;
            this._position = new THREE.Vector3(camera.position.x + 8, camera.position.y + 5, camera.position.z + 8);
            child.position.x = this._position.x;
            child.position.y = this._position.y;
            child.position.z = this._position.z;
            child.scale.x = 1.2;
            child.scale.y = 1.2;
            child.scale.z = 1.2;
            this._dice = child;
        }
        console.log("Loading OK: Dice.");
    };

    setGroup(group) {
        group.traverse($.proxy(this.setDice, this));
    }

    load() {
        const loader = new THREE.OBJLoader();
        loader.load("static/model/dice.obj", $.proxy(this.setGroup, this));
    }

    show() {
        scene.add(this._dice);
    }

    rotateTo(number) {
        if (number) {
            this._next = number;
        }
        if (this._isFirst) {
            this.show();
            this._isFirst = false;
        }
        // else {
        // Rotate from currentEvent number to next number
        console.log("Start rotating to: " + this._next);
        this._dice.rotation.x = 0;
        this._dice.rotation.y = 0;
        this._dice.rotation.z = 0;
        let r_x, r_y, r_z;
        switch (this._next) {
            case 1:
                r_x = Math.PI * 2 * 100;
                r_y = Math.PI * 2 * (100 + Math.random());
                r_z = Math.PI * 2 * 100 + Math.PI;
                break;
            case 2:
                r_x = Math.PI * 2 * 100;
                r_y = Math.PI * 2 * 100;
                r_z = Math.PI * 2 * 100 - Math.PI / 2;
                break;
            case 3:
                r_x = Math.PI * 2 * 100 - Math.PI / 2;
                r_y = Math.PI * 2 * 100;
                r_z = Math.PI * 2 * (100 + Math.random());
                break;
            case 4:
                r_x = Math.PI * 2 * 100 + Math.PI / 2;
                r_y = Math.PI * 2 * 100;
                r_z = Math.PI * 2 * (100 + Math.random());
                break;
            case 5:
                r_x = Math.PI * 2 * 100;
                r_y = Math.PI * 2 * 100;
                r_z = Math.PI * 2 * 100 + Math.PI / 2;
                break;
            case 6:
                r_x = Math.PI * 2 * 100;
                r_y = Math.PI * 2 * (100 + Math.random());
                r_z = Math.PI * 2 * 100;
                break;
        }
        TweenLite.to(this._dice.rotation, 1.5, {
            x: r_x,
            z: r_z,
            ease: Power2.easeOut,
            onComplete: $.proxy(function () {
            }, this)
        });
        TweenLite.to(this._dice.rotation, 2, {
            y: r_y,
            ease: Power4.easeOut,
            onComplete: $.proxy(function () {
            }, this)
        });
        TweenLite.to(this._dice.position, 2, {
            y: 1.5,
            ease: Bounce.easeOut,

        });
        TweenLite.to(this._dice.position, 2, {
            x: camera.position.x + 4 * (Math.random() - 0.5),
            z: camera.position.z - 2 * Math.random(),
            ease: Quad.easeOut,
            onComplete: $.proxy(function () {
                this._material.needsUpdate = true;
                TweenLite.to(this._material, 2, {
                    opacity: 0,
                    ease: Power2.easeIn,
                    onComplete: $.proxy(function () {
                        this._material.needsUpdate = false;
                        this._material.opacity = 1;
                        // $go.removeAttr("disabled");
                        // selectable = true;
                        TweenLite.to(scene.fog, 0.75, {
                            near: 11,
                            far: 22,
                            ease: Power4.easeIn
                        });
                    }, this)
                });
                setTimeout($.proxy(function () {
                    this._dice.position.x = camera.position.x + 5;
                    this._dice.position.y = camera.position.y + 5;
                    this._dice.position.z = camera.position.z + 5;
                }, this), 2000);
                setTimeout(function () {
                    $go.click();
                }, 1000);
            }, this)
        });
        TweenLite.to(scene.fog, 1, {
            near: 7,
            far: 11,
        });
    }

    get dice() {
        return this._dice;
    }

    set dice(value) {
        this._dice = value;
    }

    get material() {
        return this._material;
    }

    set material(value) {
        this._material = value;
    }

    get isFirst() {
        return this._isFirst;
    }

    set isFirst(value) {
        this._isFirst = value;
    }

    get position() {
        return this._position;
    }

    set position(value) {
        this._position = value;
    }

    get next() {
        return this._next;
    }

    set next(value) {
        this._next = value;
    }
}

class Board {
    constructor() {
        this._board = null;
        this._material = new THREE.MeshBasicMaterial();
        this._position = new THREE.Vector3(0, 0, 0);
        this._isShown = false;

        this._loader = new THREE.TextureLoader();
        this._material.map = this._loader.load('static/image/BoardTexture.jpg');
        this._material.alphaMap = this._loader.load('static/image/BoardAlpha.jpg');
        this._material.transparent = true;
        this._material.map.wrapS = THREE.RepeatWrapping;

        this.load();
    }

    setCube(child) {
        if (child instanceof THREE.Mesh) {
            child.material = this._material;
            child.position.z = this._position.z;
            child.position.x = this._position.x;
            child.position.y = this._position.y;
            child.position.y = 2;
            child.scale.x = 0.001;
            child.scale.z = 0.001;
            child.name = "Event_0";
            this._board = child;
        }
        console.log("Loading OK: Board");
    };

    setGroup(group) {
        group.traverse($.proxy(this.setCube, this));
    }

    load() {
        const loader = new THREE.OBJLoader();
        loader.load("static/model/board.obj", $.proxy(this.setGroup, this));
    }

    setTexture(number) {
        this._material.map = this._loader.load('static/image/BoardTexture_' + number + '.png');
        // this._material.map = this._loader.load('static/image/BoardTexture.jpg');
        this._material.needsUpdate = true;
    }

    show(specificEvent) {
        this._isShown = true;
        this.setTexture(specificEvent ? specificEvent : currentEvent);
        this._board.position.x = camera.position.x + 1;
        this._board.position.y = camera.position.y - 3;
        this._board.position.z = camera.position.z;
        scene.add(this._board);
        TweenLite.to(this._board.scale, 2, {
            x: 0.5,
            z: 0.362,
            delay: 0.5,
            ease: Elastic.easeOut.config(0.5, 0.3),
        });
    }

    hide() {
        if (this._isShown) {
            this._isShown = false;
            TweenLite.to(this._board.scale, 1, {
                x: 0.001,
                z: 0.001,
                ease: Expo.easeOut,
                onComplete: $.proxy(function () {
                    scene.remove(this._board);
                }, this)
            });
            TweenLite.to(this._board.position, 1, {
                x: camera.position.x + 8,
                y: camera.position.y - 3,
                z: camera.position.z - 5
            });
        }
    }

    get board() {
        return this._board;
    }

    set board(value) {
        this._board = value;
    }

    get material() {
        return this._material;
    }

    set material(value) {
        this._material = value;
    }

    get position() {
        return this._position;
    }

    set position(value) {
        this._position = value;
    }

    get loader() {
        return this._loader;
    }

    set loader(value) {
        this._loader = value;
    }
}