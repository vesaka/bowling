import Container from '$lib/game/core/container';

import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { MeshBasicMaterial, Mesh, Group, Box3, Clock } from 'three';

class Timer extends Container {
    constructor(options) {
        super(options);
        this.options = options;
        this.numbers = [];
        ///^[0-6][0-9](:[0-6][0-9]){0,2}$/.test('23:10:34');
        this.units = {};
        this.clock = new Clock(false);
        
        this.$on('start', () => {
            this.clock.start();
        });
        return this;
    }

    createText(font) {

        const {position, font: font_settings} = this.options;
        const fontSettings = Object.assign({}, {font}, font_settings);
        const geometry = new TextGeometry(':', fontSettings);

        geometry.center();

        const material = new MeshBasicMaterial({
            color: '#EE66AA',
            //wireframe: true
        });
        const group = new Group();
        for (let i = 0; i < 10; i++) {
            const mesh = new Mesh(
                    new TextGeometry(i.toString(), fontSettings),
                    material
                    );
            this.numbers.push(mesh);
        }

        const time = this.countdown = this.time = this.resolveTimeLimit();
        this.loop(time, ({index, i, m, s, c}) => {
            const numMesh = this.numbers[i].clone();
            numMesh.visible = (i === index);
            numMesh.position.x = c * this.options.spacing;
            group.add(numMesh);
            const unitKey = `${m}${s}`;

            if (!this.units[unitKey]) {
                this.units[unitKey] = [];
            }

            this.units[unitKey].push(numMesh);
        }, ({char, c}) => {
            const textMesh = new Mesh(
                    new TextGeometry(char, fontSettings),
                    material
                    );
            textMesh.position.x = c * this.options.spacing;

            group.add(textMesh);
        });
        const box = new Box3().setFromObject(group);

        group.position.set(box.min.x - (box.max.x / 2), position.y, position.z);

        return this.text = group;
    }

    resolveTimeLimit() {
        const time = this.options.time;

        if (typeof time === 'string') {
            if (/^-?\d+$/.test(time)) {
                return parseInt(time);
            } else if (/^-?\d+s$/.test(time)) {
                return parseInt(time.substring(0, time.length - 1));
            } else if (/^-?\d+ms$/.test(time)) {
                return parseInt(time.substring(0, time.length - 2)) / 1000;
            }
        } else if (typeof time === 'number') {
            return time;
        }

        return 60;
    }

    update() {
        const { time, units } = this;
        const remain = Math.max(0, time - Math.ceil(this.clock.getElapsedTime()));

        this.loop(remain, ({index, i, m: minutes, s: seconds}) => {
            const numbers = units[`${minutes}${seconds}`];
//console.log({index, len: numbers.length, key: `${minutes}${seconds}`});
            for (let j in numbers) {
                numbers[j].visible = parseInt(j) === index;
            }
        });
        
        this.countdown = remain;
    }

    loop(time, callback, backup) {
        
        const minutes = Math.floor(time / 60).toString().padStart(2, "0");
        const seconds = (time % 60).toString().padStart(2, "0");
        const timeString = `${minutes}:${seconds}`;

        for (let c in timeString) {
            const index = parseInt(timeString[c]);
            const d = c % 3;
            const n = Math.floor(c / 3);
            let max, key;
            if (!isNaN(index)) {
                if (n) {
                    max = 9;
                    key = 's';
                } else {
                    max = 6;
                    key = 'm';
                }
                
                for (let i = 0; i <= max; i++) {
                    callback.call(this, {index, i, char: timeString[c], c, m: key, s: d ? 'n' : 'd'});
                }
            } else {
                if (typeof backup === 'function') {
                    backup.call(this, {index, c, char: timeString[c]});
                }

            }
        }
    }

    start() {
        this.clock.start();
    }

    stop() {

    }

    increase(seconds = 10) {
        this.time += seconds;
        
    }
}

export default Timer;