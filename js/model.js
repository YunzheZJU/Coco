/**
 * Created by Yunzhe on 2018/1/12.
 */

'use strict';

class Grid {
    constructor(num, position, type) {
        this._cube = null;
        this._isRotated = false;
        this._isShown = false;
        this._material = new THREE.MeshBasicMaterial();
        this._num = num;
        this._position = position;
        this._type = type;

        var loader = new THREE.TextureLoader();
        this._material.map = loader.load('image/gridTexture.bmp');
        this._material.map.wrapS = THREE.RepeatWrapping;
    }

    getCube(child) {
        if (child instanceof THREE.Mesh) {
            child.material = this.material;
            child.position.z = this._position.z;
            child.position.x = this._position.x;
            child.position.y = 0;
            child.scale.x = 0.01;
            child.scale.z = 0.01;
            child.scale.y = 1;
            this._cube = child;
        }
    };

    setGroup(group) {
        group.traverse($.proxy(this.getCube, this));
    }

    load() {
        var loader = new THREE.OBJLoader();
        loader.load("model/test.obj", $.proxy(this.setGroup, this));
    }

   show() {
       scene.add(this._cube);
       TweenLite.to(this._cube.scale, 1, {
           x: 1,
           z: 1,
           ease: Elastic.easeOut,
           onComplete: $.proxy(this.rotate, this)
       });
       this._isShown = true;
   }

    rotate() {
        TweenLite.to(this._cube.rotation, 2, {
            z: -Math.PI,
            ease: Bounce.easeIn
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
}