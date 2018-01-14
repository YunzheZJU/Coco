/**
 * Created by Yunzhe on 2018/1/12.
 */

'use strict';
const $go = $("#go");

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
        this._material.map = loader.load('image/GridTexture_' + type + '_' + (num > 43 && num < 130 ? '2' : '1') + '.jpg');
        this._material.map.wrapS = THREE.RepeatWrapping;

        this.load();
    }

    setCube(child) {
        if (child instanceof THREE.Mesh) {
            child.material = this.material;
            child.position.z = this._position.z;
            child.position.x = this._position.x;
            child.position.y = this._position.y;
            child.scale.x = 0.01;
            child.scale.z = 0.01;
            child.scale.y = 0.01;
            if (this._type !== 1) {
                child.name = "Selectable";
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
        loader.load("model/grid.obj", $.proxy(this.setGroup, this));
    }

    show(delay) {
        scene.add(this._cube);
        TweenLite.to(this._cube.scale, 1 + 0.2 * (Math.random() - 0.5), {
            x: 1.25,
            y: 1,
            z: 1.25,
            delay: delay,
            ease: Elastic.easeOut,
            onComplete: $.proxy(this.rotate, this)
        });
        this._isShown = true;
    }

    rotate() {
        TweenLite.to(this._cube.rotation, 2, {
            z: -Math.PI,
            ease: Bounce.easeOut
        });
        this._isRotated = true;
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
        this._current = 1;
        this._next = 6;

        const loader = new THREE.TextureLoader();
        this._material.map = loader.load('image/Dice.jpg');
        // this._material.needsUpdate = true;
        this._material.transparent = true;
        this._material.map.wrapS = THREE.RepeatWrapping;

        this.load();
    }

    setDice(child) {
        if (child instanceof THREE.Mesh) {
            child.material = this._material;
            this._position = new THREE.Vector3(camera.position.x + 5, camera.position.y + 5, camera.position.z + 5);
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
        loader.load("model/dice.obj", $.proxy(this.setGroup, this));
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
                        $go.removeAttr("disabled");
                        selectable = true;
                        TweenLite.to(scene.fog, 0.75, {
                            near: 11,
                            far: 12
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

        this._current = this._next;
        // }
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

    get current() {
        return this._current;
    }

    set current(value) {
        this._current = value;
    }

    get next() {
        return this._next;
    }

    set next(value) {
        this._next = value;
    }
}