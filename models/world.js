import { World as CannonWorld, NaiveBroadphase, Body, GSSolver, SplitSolver,
    Material, ContactMaterial } from 'cannon-es';

class World {
    constructor(options = {}) {
        const world = new CannonWorld();
        world.gravity.set(
                options.gravity.x,
                options.gravity.y,
                options.gravity.z
        );
        world.broadphase = new NaiveBroadphase();
        
        const solver = new GSSolver();
        solver.iterations = options.solver.iterations;
        solver.tolerance = options.solver.tolerance;
        world.solver = new SplitSolver(solver);

        const material = new Material('physics');
        
        const physics = new ContactMaterial(material, material, options.physics);
        world.addContactMaterial(physics);
        return world;
    }
    
    createBody() {
        
    }
    
    createModel() {
        
    }
}

export default World;
