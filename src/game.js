class Game {
    constructor(cathanvas) {
        this.canvas = cathanvas;
        // this.colliderTree = new Quadtree();
        this.colliderTree = {};

        this.gameObjects = [];
        this.physObjects = [];
        this.TICK = 50;
        this.physicsLoop = null;

        this.addListeners();
    }

    addListeners = () => {
        window.addEventListener('click', this.onClick);
    };

    onClick = (e) => {
        console.log('click event:', e);
        const clickCoords = [e.offsetX, e.offsetY];
        this.detectCollisions(clickCoords);
    };

    detectCollisions = (clickCoords) => {
        this.physObjects.forEach(obj => {
            if (obj.collider) {

            }
        });
    };

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
