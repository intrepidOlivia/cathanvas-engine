class Game {
    constructor(cathanvas) {
        this.cathanvas = cathanvas;
        this.gameObjects = [];
        this.physObjects = [];
        this.scenes = [];
        this.scene = null;
        this.TICK = 50;
        this.physicsLoop = null;
    }

    initializeCollision(quadtree) {
        this.colliderTree = quadtree;
    }

    onClick = (e) => {
        const clickCoords = [e.offsetX, e.offsetY];
    };

    detectCollisions = (clickCoords) => {
        this.physObjects.forEach(obj => {
            if (obj.collider) {

            }
        });
    };

    createObject = (newObj) => {
        this.gameObjects.push(newObj);
        this.cathanvas.addRenderObject(newObj);
        this.addPhysicsObject(newObj);
        this.cathanvas.addRenderObject(newObj);
    };

    startGame = () => {
        // Set up scene
        if (!this.scene) {
            this.scene = new Scene();
        }

        this.startPhysics();
        this.cathanvas.startRendering();
    };

    endGame = () => {
        window.alert("Game Over!");
        this.cathanvas.stopRendering();
        this.stopPhysics();
    };

    addPhysicsObject = (obj) => {
        if (obj.doPhysics) {
            this.physObjects.push(obj);
        }

        if (obj.collider) {

        }
    };

    startPhysics = () => {
        setTimeout(this.physicsUpdate, this.TICK);
        this.physicsLoop = true;
    };

    stopPhysics = () => {
        this.physicsLoop = null;
    };

    physicsUpdate = () => {
        if (!this.physicsLoop) {
            return;
        }

        // TODO: Check collision?
        const collisions = {};

        this.physObjects.forEach(obj => {
            if (obj.doPhysics) {
                obj.doPhysics(collisions)
            }
        });

        this.gameObjects.forEach(obj => {
            if (obj.onPhysicsUpdate) {
                obj.onPhysicsUpdate(collisions);
            }
        });

        // TODO: Update all colliders

        setTimeout(this.physicsUpdate, this.TICK);
    };

    togglePause() {
        if (this.physicsLoop) {
            this.stopPhysics();
            return;
        }

        this.startPhysics();
    }

    addScene(scene) {
        this.scenes.push(scene);
        return this.scenes.length - 1;
    }

    loadScene(index) {
        this.scene = this.scenes[index];
    }
}

class GameObject {
    constructor(bounds) {
        if (bounds) {
            // Set up collider
            this.collider = new Collider(bounds);
        }
        this.instanceId = new Date().getUTCMilliseconds();
    }
}

class Scene {
    constructor(colliders = []) {
        this.colliders = colliders;
    }
}
