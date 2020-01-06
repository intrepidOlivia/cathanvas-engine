class Game {
    constructor(cathanvas) {
        this.canvas = cathanvas;
        // this.colliderTree = new Quadtree();

        this.gameObjects = [];
        this.physObjects = [];
        this.TICK = 300;
        this.physicsLoop = null;
    }

    createObject = (newObj) => {
        this.gameObjects.push(newObj);
        this.canvas.addRenderObject(newObj);
        this.addPhysicsObject(newObj);
        this.canvas.addRenderObject(newObj);
    };

    startGame = () => {
        this.startPhysics();
        canvas.startRendering();
    };

    endGame = () => {
        window.alert("Game Over!");
        canvas.stopRendering();
        this.stopPhysics();
    };

    addPhysicsObject = (obj) => {
        if (obj.doPhysics) {
            this.physObjects.push(obj);
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

        this.physObjects.forEach(obj => {
            if (obj.doPhysics) {
                obj.doPhysics()
            }
        });

        this.gameObjects.forEach(obj => {
            if (obj.onPhysicsUpdate) {
                obj.onPhysicsUpdate();
            }
        });

        setTimeout(this.physicsUpdate, this.TICK);
    };

    togglePause() {
        if (this.physicsLoop) {
            this.stopPhysics();
            return;
        }

        this.startPhysics();
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
