const NORTH = 'north';
const SOUTH = 'south';
const EAST = 'east';
const WEST = 'west';

const BODY_RADIUS = 5;

class Pill extends CanvasObject {
    constructor(cathanvas, game, snake, options = {}) {
        super();
        this.canvas = cathanvas;
        this.game = game;
        this.snake = snake;
        this.radius = 5;
        this.chooseRandomLocation(cathanvas);
    }

    render = (cathanvas) => {
        cathanvas.drawRect([this.bounds.left, this.bounds.top], this.radius * 2, this.radius *2, '#000000');
    };

    /**
     * Will be called after all objects have performed their doPhysics function
     */
    onPhysicsUpdate = () => {
        if (this.snake.bounds.intersects(this.bounds)) {
            this.chooseRandomLocation(this.canvas);
            this.snake.growBody();
            this.game.TICK *= 0.85;
        }
    };

    chooseRandomLocation = (cathanvas) => {
        const randX = Math.floor(Math.random() * cathanvas.width);
        const randY = Math.floor(Math.random() * cathanvas.height);
        this.bounds = new Rect([randX - this.radius, randY - this.radius, randX + this.radius, randY + this.radius]);
        console.log('pill bounds set');
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
        this.game.TICK = options.speed || 500;
        this.addListeners();
    }

    addListeners = () => {
        window.addEventListener('keydown', this.onKeyDown);
    };

    removeListeners = () => {
        window.removeEventListener('keydown', this.onKeyDown);
    };

    onKeyDown = (e) => {
        if (e.key === ' ') {
            this.game.togglePause();
            return;
        }

        this.changeDirection(e);
    };

    changeDirection = (e) => {
        switch (e.key) {
            case 'ArrowUp':
                if (this.orientation !== SOUTH) {
                    this.orientation = NORTH;
                }
                break;
            case 'ArrowRight':
                if (this.orientation !== WEST) {
                    this.orientation = EAST;
                }
                break;
            case 'ArrowDown':
                if (this.orientation !== NORTH) {
                    this.orientation = SOUTH;
                }
                break;
            case 'ArrowLeft':
                if (this.orientation !== EAST) {
                    this.orientation = WEST;
                }
                break;
        }
    };

    initBody = (canvas) => {
        const centerx = canvas.width / 2;
        const centery = canvas.height / 2;
        this.bounds = new Rect([centerx - BODY_RADIUS, centery - BODY_RADIUS, centerx + BODY_RADIUS, centery + BODY_RADIUS]);
        console.log('snake bounds set');
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

    /**
     * Will be called after all objects have performed their doPhysics function
     */
    onPhysicsUpdate = () => {
        if (this.isAtBounds(this.bodyLocation[0], this.canvas)) {
            this.game.endGame();
            return;
        }
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

    isAtBounds = (head, cathanvas) => {
        if (head.x < 0 || head.x >= cathanvas.width) {
            return true;
        }

        if (head.y < 0 || head.y >= cathanvas.height) {
            return true;
        }

        return false;
    };
}