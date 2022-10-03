import Model from '$lib/game/core/3d/models/model';
import { Body, Box, Vec3, Material, Plane as CannonPlane } from 'cannon-es';
import { MeshBasicMaterial, MeshPhongMaterial,
    BoxBufferGeometry,PlaneBufferGeometry, Mesh, DoubleSide,
    RepeatWrapping, TextureLoader} from 'three';

class Plane extends Model {
    
    static defaultShape = new CannonPlane();
    
    constructor(options) {
        super(options);
        return this;
    }
    
    createBody() {
        return new Body({
            mass: 0,
            shape: new Box(new Vec3(this.size.x / 2, this.size.y / 2, this.size.z / 2)),
            position: new Vec3(0, -this.size.y / 2, 0),
            material: new Material({friction: 1, restitution: 0})
        });
    }
    
    createModel() {
        const roadTextureLoader = new TextureLoader();
        const roadTexture = roadTextureLoader.load('/assets/textures/race/road.jpg');
        roadTexture.wrapS = roadTexture.wrapT = RepeatWrapping;
        //roadTexture.repeat.set(1, 4);
        const plane = new Mesh(
            new PlaneBufferGeometry(this.size.x, this.size.y),
            new MeshBasicMaterial({
                //map: roadTexture,
                side: DoubleSide,
                color: 0x998899
            })
        );

        return plane;
    }
    
    createBodyMaterial() {
        return Model.prototype.defaultMaterial;
    }
    
    createShappe() {
        return Plane.prototype.defaultShape;
    }
    
    setRotation(x = 0, y = 0, z = 0) {
        this.body.quaternion.setFromEuler(x, y, z);
        this.model.rotation.set(x, y, z);
        this.model.quaternion.copy(this.body.quaternion);
        
        return this;
    }
}

export default Plane;