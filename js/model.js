/**
 * Created by Yunzhe on 2018/1/12.
 */

'use strict';

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
            child.scale.y = 1;
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

    show() {
        scene.add(this._cube);
        TweenLite.to(this._cube.scale, 3, {
            x: 1.25,
            z: 1.25,
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
        this.dice = null;
        this._material = new THREE.MeshBasicMaterial();
        this.isFirst = true;
        this._position = new THREE.Vector3(0, 20, 0);
        this.current = 1;
        this.next = 6;

        const loader = new THREE.TextureLoader();
        this._material.map = loader.load('image/Dice.jpg');
        this._material.map.wrapS = THREE.RepeatWrapping;

        this.load();
    }

    setDice(child) {
        if (child instanceof THREE.Mesh) {
            child.material = this._material;
            child.position.z = this._position.z;
            child.position.x = this._position.x;
            child.position.y = this._position.y;
            child.name = "Ground";
            this.dice = child;
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
        scene.add(this.dice);
        TweenLite.to(this.dice.position, 3, {
            y: 12,
            ease: Bounce.easeOut,
            onComplete: $.proxy(this.rotateTo, this)
        });
    }

    rotateTo(number) {
        console.log("rotateTo() is called");
        if (number) {
            this.next = number;
        }
        if (this.isFirst) {
            this.show();
            this.isFirst = false;
        }
        else {
            // Rotate from current number to next number
            console.log("Start rotating to: " + this.next);

            this.current = this.next;
        }
    }
}