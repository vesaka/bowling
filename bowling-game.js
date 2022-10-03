import GameBase from '$lib/game/core/game-base';
import { Clock, BoxGeometry, SphereGeometry,
        MeshBasicMaterial, PerspectiveCamera } from 'three';

import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader';
    
import { Body, Box, Vec3, Sphere } from 'cannon-es';
import Ball from '$lib/game/bowling/models/ball';
import PinBox from '$lib/game/bowling/models/pin-box';
import Pin from '$lib/game/bowling/models/pin';
import Plane from '$lib/game/bowling/models/plane';
import World from '$lib/game/bowling/models/world';
import Timer from '$lib/game/bowling/ui/timer';
import { GUI, Controller } from  'dat.gui';
import controlPlane from './ui/plane-gui';
import stats from 'stats.js';


class BowlingGame extends GameBase {
    constructor(options) {
        super(options);
        this.onPause = false;
        this.id = 0;
        this.world = new World(this.options.objects.world);
        this.camera = this.createCamera(this.options.camera);
        this.scene.add(this.camera);
        this.ball = this.createBall();
        this.plane = this.createPlane();
        
        
        this.preparePinPresets();
        this.setupOrbitControls();
        
        this.$on('pause', () => { this.onPause = true });
        this.$on('resume', () => { this.onPause = false });
        /**
         * Load fonts
         */
        
        //const font = fontLoader.parse(require(`$assets/fonts/${options.font}.ttf`));

        return this;
    }
    
    onFontLoaded(font) {
        this.timer = new Timer(this.options.ui.timer);
        this.scene.add(this.timer.createText(new Font(font)));
    }

    createBall() {
        const {ball: sphere} = this.options.objects;

        const ball = new Ball({
            material: new MeshBasicMaterial({
                color: sphere.color,
                wireframe: true
            }),
            geometry: new SphereGeometry(sphere.radius, sphere.fragments.width, sphere.fragments.height),
            position: new Vec3(
                    sphere.position.x,
                    sphere.position.y,
                    sphere.position.z
            ),
            options: sphere
        });

        ball.body.addEventListener('collide', (ev) => {
                
            if (!ev.body.visible) {
                return;
            }
            
            this.$emit();
            const pin = this.pins[ev.body.__type][ev.body.__id];

            if (pin) {
                this.$emit(`${ev.body.__type}hit`, pin);
                pin.model.material = pin.model.material.clone();
                pin.set('wasHit', true);
            }

        });

        ball.speed = sphere.speed * 10;

        this.add(ball);
        return ball;
    }

    createPlane() {
        const {plane: options, world} = this.options.objects;
        const object = new Plane({
            size: {
                x: world.size.x,
                y: world.size.y,
                z: options.z
            }
        });

        object.setRotation(
                options.rotation.x,
                options.rotation.y,
                options.rotation.z
        )
        .setPosition(
                options.position.x,
                options.position.y,
                options.position.z
                );
        return object;
    }

    createPinPreset(preset, type, i) {
        const pin = new PinBox(preset);
        this.add(pin);
        pin.set('visible', false);
        pin.set('__type', type);
        pin.set('__id', i);
        pin.type = type;
        pin.model.material = pin.model.material.clone();
        pin.model.material.color.set(preset.color);
        return pin;
    }

    preparePinPresets() {
        const {world, pins} = this.options.objects;
        const presets = {};
        const body = new Body({mass: pins.mass});
        const material = new MeshBasicMaterial({
            color: 0xff88ff,
            wireframe: true,
            transparent: true
        });
        this.pins = {};
        
        this.placements = [];
        this.cells = [];
        let count = 0;
        for (let type in pins.types) {
            this.pins[type] = [];
            
            const preset = Object.assign({}, pins.default, pins.types[type]);
            const vector = new Vec3(preset.size.x, preset.size.y, preset.size.z);
            
            count += preset.max;
            Object.assign(preset, {
                body,
                vector,
                material,
                geometry: new BoxGeometry(vector.x * 2, vector.y * 2, vector.z * 2, 2, 2, 2),
                shape: new Box(vector)
            });


            presets[type] = preset;

            for (let i = 0; i < preset.max; i++) {
                this.pins[type].push(this.createPinPreset(preset, type, i));
            }
        }
        
        const remain = count % pins.placement.columns;
        const lastRow = pins.placement.rows - 1;
        const cellHeight = Math.abs(pins.placement.z[1] - pins.placement.z[0])  / pins.placement.rows;
        const gridWidth = Math.abs(pins.placement.x[1] - pins.placement.x[0]);
        for (let n = 0; n < count; n++) {
            const column = n % pins.placement.columns;
            const row = Math.floor(n / pins.placement.columns);
            const cellWidth = Math.floor(gridWidth / (row !== lastRow ? pins.placement.columns : remain));
            this.placements.push(n);
            
            this.cells.push({
                x: [pins.placement.x[0] + column*cellWidth, pins.placement.x[0] + (column + 1)*cellWidth ],
                y: pins.placement.y,
                z: [pins.placement.z[0] - row*cellHeight, pins.placement.z[0] - (row + 1)*cellHeight ]
            });
        }
        
        this.presets = presets;

    }
    
    prepareCellsAndPlacements() {
        const {world, pins} = this.options.objects;
        this.placements = [];
        this.cells = [];
    }

    createCamera(options) {

        const camera = new PerspectiveCamera(
                options.fov,
                this.width / this.height,
                options.near,
                options.far
                );

        camera.position.set(
                options.position.x,
                options.position.y,
                options.position.z
                );


        return camera;
    }
    
    getPlacement() {
        if (this.placements.length > 0) {
            const at = Math.floor(Math.random()*this.placements.length);
            const index = this.placements[at];
            this.placements.splice(at, 1);
            return index;
        }
        
        return null;
    }
    
    returnCell(i) {
        this.placements.push(i);
    }
    
    setupUI(fonts) {
    }
    
    async build() {
        const {world, scene, camera, canvas, ball, plane, width, height, renderer, pins, options, controls} = this;
        const {objects} = this.options.objects;

        const clock = new Clock();
        const timeStep = 1 / 60;
        
        this.add(plane);
        //controlPlane(plane);
        this.$on('extrahit', pin => {
            this.timer.increase();
        });
        this.$on('pointerstop', () => {
            ball.movesLeft = ball.movesRight = false;
        });
        
        const mx = (width / 4);
        this.$on('pointerstart', (ev) => {
            let locationX = ev.touches[0].screenX;
           

            if (ev.touches.length === 2) {
                locationX = ev.touches[1].screenX;
            } else if (ev.touches.length === 1) {
                locationX = ev.touches[0].screenX;
            } else {
                return;
            }
//
//
            if (locationX < mx) {
                ball.movesLeft = true;
                ball.movesRight = false;
            } else {
                ball.movesRight = true;
                ball.movesLeft = false;
            }
        });

        this.$on('crash', (object) => {
        });

        document.addEventListener('keydown', (ev) => this.onKeyDown.call(this, ev));
        document.addEventListener('keyup', (ev) => this.onKeyUp.call(this, ev));
        document.addEventListener('touchstart', (ev) => this.onClick.call(this, ev));
        document.addEventListener('touchend', (ev) => this.onRelease.call(this, ev));
        document.addEventListener('keypress', (ev) => this.onKeyPress.call(this, ev));
        const roRad = Math.PI / 180;
        const HALF_PI = Math.PI / 2;
        
        this.$emit('start', 1);
        let delta;
        const animate = () => {
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
            if (controls) {
                controls.update();
            }
            if (true === this.onPause) {
                return;
            }
            
            this.timer.update();
            delta = clock.getDelta();
            const moveDistance = ball.speed * delta;
            const rotateAngle = HALF_PI * delta;
            world.step(timeStep, delta);

            ball.model.rotation.x -= rotateAngle;
            if (plane.model.material && plane.model.material.map) {
                plane.model.material.map.offset.y -= delta * 0.15;
                if (plane.model.material.map.offset.y < -1) {
                    plane.model.material.map.offset.y = 0;
                }
            }

            if (ball.movesLeft) {
                ball.model.rotation.z -= rotateAngle;
                //ball.rotateZ(ball.model.rotation.z - rotateAngle)
                if (ball.body.position.x > -270) {
                    ball.body.position.x -= moveDistance;
                }

                if (camera.position.x > -150) {
                    camera.position.x -= moveDistance * 0.6;
                    if (camera.rotation.z > -5 * roRad) {
                        camera.rotation.z -= 0.2 * roRad;
                    }
                }
                this.increaseFov();
            } else if (ball.movesRight) {
                ball.model.rotation.z += rotateAngle;
                if (ball.body.position.x < 270) {
                    ball.body.position.x += moveDistance;
                    camera.updateProjectionMatrix();
                }

                if (camera.position.x < 150) {
                    camera.position.x += moveDistance * 0.6;
                    if (camera.rotation.z < 5 * roRad) {
                        camera.rotation.z += 0.2 * roRad;
                    }
                }
                this.increaseFov();
            } else {
                this.decreaseFov(delta);
                delta = camera.rotation.z;
                camera.rotation.z -= delta / 10;
            }

            ball.update();
            const chance = Math.random();
            for (let type in pins) {
                const preset = this.presets[type];

                for (let i = 0; i < pins[type].length; i++) {
                    const pin = pins[type][i];
                    
                    
                    if (true === pin.visible) {
                        if (pin.model.position.z > camera.position.z) {
                            this.placements.push(pin.index);
                            pin.hide(preset.idle);
                        } else {
                            pin.increaseZ(preset.speed).update();
                        }
                    } else if (chance < preset.chance) {
                        const index = this.getPlacement();
                        if (index) {
                            pin.reset(this.cells[index], index);
                        }
                        break;
                    }

                }
            }


            //this.onPause = true;
            
        };
        animate();
    }
    


    increaseFov() {
        if (this.camera.fov < 60) {
            this.camera.fov += 0.5;
            this.camera.updateProjectionMatrix();
        }
    }

    decreaseFov() {
        if (this.camera.fov > 45) {
            this.camera.fov -= 0.5;
            this.camera.updateProjectionMatrix();
        }
    }

    onMove(evt) {
        this.$emit('pointerstart', evt);
    }


    
    onKeyDown(ev) {
        const code = this.getKeyCharCode(ev);

        if (37 === code) {
            this.ball.movesLeft = true;
            this.ball.movesRight = false;
        } else if (39 === code) {
            this.ball.movesRight = true;
            this.ball.movesLeft = false;
        }
    }

    onKeyUp(ev) {
        const code = this.getKeyCharCode(ev);
        if ([37, 39].indexOf(code) > -1) {
            this.$emit('pointerstop', ev)
        }
    }
    
    onKeyPress(ev) {
        const code = this.getKeyCharCode(ev);
        if (32 === code) {
            this.$emit(this.onPause ? 'resume' : 'pause');
            ///this.onPause = !this.onPause;
        }

    }

    onClick(ev) {
        //navigator.vibrate([100,30,100,30,100,30,200,30,200,30,200,30,100,30,100,30,100]);
        //navigator.vibrate([300])
        this.$emit('pointerstart', ev);
    }

    onRelease(ev) {
        this.$emit('pointerstop', ev);
    }

    destroy() {

    }

}

export default BowlingGame;