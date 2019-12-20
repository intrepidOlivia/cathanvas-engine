const NORTH = 'north';
const SOUTH = 'south';
const EAST = 'east';
const WEST = 'west';

const BODY_RADIUS = 5;

class Pill extends CanvasObject {
    constructor(cathanvas, game, options = {}) {
        super();
        this.canvas = cathanvas;
        this.game = game;
        this.radius = 5;
        this.chooseRandomLocation(cathanvas);
    }

    render = (cathanvas) => {
        cathanvas.drawRect([this.bounds.left, this.bounds.top], this.radius * 2, this.radius *2, '#000000');
    };

    chooseRandomLocation = (cathanvas) => {
        const randX = Math.floor(Math.random() * cathanvas.width);
        const randY = Math.floor(Math.random() * cathanvas.height);
        this.bounds = new Rect([randX - this.radius, randY - this.radius, randX + this.radius, randY + this.radius]);
    };
}

class Snake extends CanvasObject {
    constructor(cathanvas, game, options = {}) {
        super();
        this.length = options.length || 5;
        this.bodyLocation = this.initBody(cathanvas);
        this.style = options.style || "#000000";
        this.orientation = 'east';
        this.canvas = cathanvas;
        this.game = game;
        this.speed = options.speed || 1;
        this.addListeners();
    }

    addListeners = () => {
        window.addEventListener('keydown', this.onKeyDown);
    };

    removeListeners = () => {
        window.removeEventListener('keydown', this.onKeyDown);
    };

    onKeyDown = (e) => {
        // e.preventDefault();

        if (e.key === ' ') {
            this.game.togglePause();
            return;
        }

        this.changeDirection(e);
    };

    changeDirection = (e) => {
        switch (e.key) {
            case 'ArrowUp':
                this.orientation = NORTH;
                break;
            case 'ArrowRight':
                this.orientation = EAST;
                break;
            case 'ArrowDown':
                this.orientation = SOUTH;
                break;
            case 'ArrowLeft':
                this.orientation = WEST;
                break;
        }
    };

    initBody = (canvas) => {
        const centerx = canvas.width / 2;
        const centery = canvas.height / 2;
        this.bounds = new Rect([centerx - BODY_RADIUS, centery - BODY_RADIUS, centerx + BODY_RADIUS, centery + BODY_RADIUS]);
        return [
            {x: centerx, y: centery},
            {x: centerx - (1 * BODY_RADIUS), y: centery},
            {x: centerx - (2 * BODY_RADIUS), y: centery},
            {x: centerx - (3 * BODY_RADIUS), y: centery},
            {x: centerx - (4 * BODY_RADIUS), y: centery},
        ];
    };

    render = (cathanvas) => {
        for (let i = 0; i < this.bodyLocation.length; i++) {
            let b = this.bodyLocation[i];
            cathanvas.drawRect([b.x - BODY_RADIUS, b.y - BODY_RADIUS], BODY_RADIUS * 2, BODY_RADIUS * 2, this.style)
        }
    };

    moveSnake = () => {
        let segment = this.moveBodySegment(this.bodyLocation[0], this.orientation);
        this.bounds = new Rect([segment.x - BODY_RADIUS, segment.y - BODY_RADIUS, segment.x + BODY_RADIUS, segment.y + BODY_RADIUS]);

        if (this.isAtBounds(segment, this.canvas)) {
            this.game.endGame();
            return;
        }

        for (let i = 0; i < this.bodyLocation.length; i++) {
            const next = this.bodyLocation[i];
            this.bodyLocation[i] = segment;
            segment = next;
        }
    };

    growBody = () => {
        const lastSegment = this.bodyLocation[this.bodyLocation.length - 1];
        this.bodyLocation.push({x: lastSegment.x, y: lastSegment.y});
    };

    doPhysics = () => {
        this.moveSnake();
    };

    moveBodySegment = (coords, orientation) => {
        if (this.isAtBounds(coords, this.canvas)) {
            return;
        }

        switch (orientation) {
            case NORTH:
                return { x: coords.x, y: coords.y - (BODY_RADIUS * 2) };
                break;
            case EAST:
                return { x: coords.x + (BODY_RADIUS * 2), y: coords.y };
                break;
            case SOUTH:
                return { x: coords.x, y: coords.y + (BODY_RADIUS * 2)};
                break;
            case WEST:
                return { x: coords.x - (BODY_RADIUS * 2), y: coords.y };
        }
    };

    isAtBounds = (coords, cathanvas) => {
        if (coords.x < 0 || coords.x >= cathanvas.width) {
            return true;
        }

        if (coords.y < 0 || coords.y >= cathanvas.height) {
            return true;
        }

        return false;
    };
}

class Game {
    constructor(cathanvas) {
        this.canvas = cathanvas;
        // this.colliderTree = new Quadtree();

        this.physObjects = [];
        this.TICK = 300;
        this.physicsLoop = null;

        // Add snake
        this.snake = new Snake(cathanvas, this);
        this.createObject(this.snake);

        // Add pill
        this.pill = new Pill(cathanvas, this);
        this.createObject(this.pill);
    }

    createObject = (newObj) => {
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
        this.physObjects.push(obj);
    };

    startPhysics = () => {
        setTimeout(this.physicsUpdate, this.TICK);
        this.physicsLoop = true;
        // this.physicsLoop = setInterval(this.physicsUpdate, this.TICK)
    };

    stopPhysics = () => {
        // clearInterval(this.physicsLoop);
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

        // ON PILL COLLISION
        if (this.snake.bounds.intersects(this.pill.bounds)) {
            this.pill.chooseRandomLocation(this.canvas);
            this.snake.growBody();
            this.TICK *= 0.85;
        }

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
