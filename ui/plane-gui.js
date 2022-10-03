import { GUI, Controller } from  'dat.gui';

export default function (plane) {
    const gui = new GUI({name: 'My GUI', closeOnTop: false});
    const attr = ['x', 'y', 'z'];

    gui.addFolder('Size');
    for (let n in attr) {
        gui.add(plane.model.scale, attr[n], 1, 30, 1);
    }
    gui.addFolder('Position');
    for (let n in attr) {
        gui.add(plane.model.position, attr[n], -3000, 3000, 10);
    }
    gui.addFolder('Rotation');
    for (let n in attr) {
        gui.add(plane.model.rotation, attr[n], -Math.PI, Math.PI, 0.01);
    }
}