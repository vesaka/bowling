import Model from '$lib/game/core/3d/models/model';
import { BoxBufferGeometry, MeshBasicMaterial } from 'three';
import { Vec3, Box, Body } from 'cannon-es';
class PinBox extends Model {
    constructor(options) {
        super(options);

        this.model.castShadow = true;
        this.model.receiveShadow = true;
        this.body.linearDamping = 0.9;
        this.body.useQuaternion = false;
        return this;
    }

    getSize() {
        if (this.size instanceof Vec3) {
            return this.size;
        }

        if (Array.isArray(this.size)) {
            return new Vec3(this.size[0] || 0, this.size[1] || 0, this.size[2] || 2);
        } else if (null === this.size) {
            return new Vec3(0, 0, 0);
        } else if (typeof this.size === 'object') {
            return new Vec3(this.size.x || 0, this.size.y || 0, this.size.z || 0);
        }

        return new Vec3(0, 0, 0);
    }

    createShape() {

        if (this.shape) {
            return this.shape;
        }
        const size = this.getSize();

        return new Box(size);
    }

    createGeometry() {
        return this.geometry;
        const size = this.getSize();
        if (this.geometry) {
            return this.geometry;
        }
        return new BoxBufferGeometry(size.x / 2, size.y / 2, size.z / 2, 1, 1, 1);
    }

    createMaterial() {
        if (this.material) {
            return this.material;
        }
        return MATERIAL;
    }

    createBody() {
        return new Body({
            mass: this.mass,
            material: this.physicsMaterial,
            shape: this.shape,
        });
    }

    reset(start, index) {
        const {size} = this;
        this.setPosition(
                Math.between(start.x[0], start.x[1]),
                start.y,
                Math.between(start.z[0], start.z[1])
        ).setRotation(0, 0, 0)
        .updateQuaternion().set('visible', true);

        this.body.velocity.set(0, 0, 0);
        this.body.angularVelocity.set(0, 0, 0);
        this.body.wakeUp();
        this.index = index;
    }

    hide(at) {
        this.setPosition(at.x, at.y, at.z)
                .setRotation(0, 0, 0)
                .set('visible', false);
        
        this.body.sleep();
        this.index = null;
    }

};



export default PinBox;
