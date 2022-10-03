import Model from '$lib/game/core/3d/models/model';
import { ShaderMaterial, MeshBasicMaterial, LatheGeometry, Vector2, DoubleSide, Group, Mesh, Euler } from 'three';
import { Body, Cylinder, Quaternion, Vec3, Material } from 'cannon-es';
const halfExtents = new Vec3(15, 100, 20);

class Pin extends Model {
    //static geometry = null;
    constructor(options) {
        options.height = 100;
        super(options);


        this.body.linearDamping = 0.9;
        this.model.position.copy(this.body.position);
        return this;
    }
    //static geometry = null;
    createShape() {
        //return new ;
    }

    createModel() {
        const mesh = new Mesh(Pin.prototype.createGeometry(this.height), Pin.prototype.getThreeMaterial());

        //mesh.quaternion.copy(new Quaternion().setFromEuler(new Euler(-Math.PI / 2, 0, 0)));

        const group = new Group();
        group.add(mesh);
        return group;
    }

    createBody() {
        const h = this.height || 100;
        return new Body({
            mass: this.mass || 0,
            shape: Pin.prototype.getShape(h),
            quaternion: Pin.prototype.quat, // Because of the cylinder up Direction and three Of up The direction is different 90 degree , Here we spin first 90 Degree makes the cylinder “ stand up ”.
            position: this.position,
            material: Pin.prototype.material
        });
    }

    bezier(a, b, c, d) {
        let step = 0.1, points = [], f;

        for (let t = 0; t < 1; t += step) {
            f = 1 - t;
            points.push([
                (f * f * f * a[0]) + (3 * f * f * t * b[0]) + (3 * f * t * t * c[0]) + (t * t * t * d[0]),
                (f * f * f * a[1]) + (3 * f * f * t * b[1]) + (3 * f * t * t * c[1]) + (t * t * t * d[1]),
            ]);
        }

        return points;
    }

    polyBezier() {
        const step = 0.1;
        let points = [], x, y, f, l,
                c, values = [];

        for (let i = 0; i < arguments.length; i++) {
            if (arguments[i][0] && arguments[i][1]) {
                points.push(arguments[i]);
            }
        }
        const length = points.length;
        const last = length - 1;
        const start = points[0];
        const end = points[l];
        for (let t = 0; t <= 1; t += step) {
            f = 1 - t;
            x = y = 0;
            for (let n = 0; n < length; n++) {
                c = Math.binom(last, last - n) * Math.pow(f, last - n) * Math.pow(t, n);
                x += c * points[n][0];
                y += c * points[n][1];
            }

            values.push([x, y]);
        }
        return values;
    }
}

Pin.prototype.getShape = (h) => {
    if (!Pin.prototype.cylinder) {
        Pin.prototype.cylinder = new Cylinder(h * (1 / 3), h * (1 / 3), h, h * 0.18);
    }
    
    return Pin.prototype.cylinder;
};

Pin.prototype.quat = new Quaternion().setFromEuler(Math.PI / 8, 0, 0);


Pin.prototype.material = new Material({friction: 0.0, restitution: 1});

Pin.prototype.getThreeMaterial = () => {
    if (!Pin.prototype.shaderMaterial) {
        Pin.prototype.shaderMaterial = new ShaderMaterial({
            vertexShader: `
            varying vec3 vPosition;
            varying vec3 vNormal;
            void main() {
                vNormal = normal;
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
        `,
            fragmentShader: `
            varying vec3 vPosition;
            varying vec3 vNormal;
            void main() {
                                // Light vector 
                vec3 light = vec3(10.0, 10.0, 10.0);
                float strength = dot(light, vNormal) / length(light);
                float y = vPosition.y;
                if(y < 65.8 && y > 64.2 || y < 63.7 && y > 62.1) {
                    gl_FragColor=vec4(1.0, 0.4 * pow(strength, 2.0), 0.4 * pow(strength, 2.0), 1.0);
                } else {
                    gl_FragColor=vec4( 0.6 + 0.4 * pow(strength, 2.0), 0.6 + 0.4 * pow(strength, 2.0), 0.6 + 0.4 * pow(strength, 2.0), 1.0);
                }
            }
        `,
            side: DoubleSide
        });
        
        Pin.prototype.meshMaterial = new MeshBasicMaterial({
            color: 0xff88ff,
            wireframe: true,
            transparent: true
        });
    }
    
    return Pin.prototype.meshMaterial;
};

Pin.prototype.createGeometry = (h = 100) => {
    if (Pin.prototype.geometry) {
        return Pin.prototype.geometry;
    }
    const points = [];
    const vertices = Pin.prototype.polyBezier(
            [0, -h / 5],
            [h * 0.15, -h / 5],
            [h / 4, h / 10],
            [h * 0.4, h * (1 / 3)],
            [-h / 2, h * (3 / 4)],
            [h * 0.35, h],
            [h * 0.15, h + (h / 5)],
            [h * 0.05, h + (h / 5)],
            [0, h + (h / 5)]);


    for (let i = 0; i < vertices.length; i++) {
        points.push(new Vec3(vertices[i][0], vertices[i][1]));
    }
    Pin.prototype.geometry = new LatheGeometry(points);
    //geometry.computeVertexNormals();
    return Pin.prototype.geometry;

}
;

export default Pin;
