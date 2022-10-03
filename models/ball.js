import Model from '$lib/game/core/3d/models/model';
import { Sphere, Body } from 'cannon-es';
import { SphereGeometry, MeshBasicMaterial, Mesh } from 'three';
class Ball extends Model {
    constructor(options) {
        super(options);
        this.body.linearDamping = 0.9;
        this.model.useQuaternion = true;
        return this;
    }
    
    createGeometry() {
        return new SphereGeometry(
                this.options.radius,
                this.options.fragments.width,
                this.options.fragments.height
        )
    }
    
    createThreeMaterial() {
        return new MeshBasicMaterial({
            color: 0xaaff66,
            wireframe: true
        });
    }

    createBody() {
        return new Body({
            mass: 0,
            material: this.createBodyMaterial(),
            shape: this.createShape(),
            position: this.getPosition()
        });
    }


    createShape() {
        return new Sphere(this.options.radius);
    }
    
    update() {
        this.model.position.copy(this.body.position);
        //this.model.quaternion.copy(this.body.quaternion);
        return this;
    }

}
;

export default Ball;