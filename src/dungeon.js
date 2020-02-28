const RIGHT = 'right';
const LEFT = 'left';
const DOWN = 'down';
const UP = 'up';

const DIRECTIONS = {
    ArrowUp: UP,
    ArrowLeft: LEFT,
    ArrowRight: RIGHT,
    ArrowDown: DOWN,
};

const SPEED = 10;

class Dungeon extends Game {
    constructor() {
        super();
        this.addListeners();
        this.player = {};
        this.movement = {
            [RIGHT]: this.moveRight,
            [LEFT]: this.moveLeft,
            [UP]: this.moveUp,
            [DOWN]: this.moveDown,
        };
    }

    addListeners = () => {
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
    };

    onKeyDown = (e) => {
        this.nextMove = DIRECTIONS[e.key];
    };

    onKeyUp = (e) => {
        const key = DIRECTIONS[e.key];

        if (this.nextMove === key) {
            this.nextMove = null;
        }
    };

    moveNext = () => {
        // TODO: Make movement direction contiguous
        if (this.nextMove) {
            this.movement[this.nextMove](this.player.sprite);
        }
    };

    doPhysics() {
        this.moveNext();
    }

    moveRight = (sprite) => {
        // TODO: Check for collision
        const pos = sprite.position;
        this.player.sprite.moveSpriteTo([ pos[0] + SPEED, pos[1]]);
    };

    moveLeft = (sprite) => {
        const pos = sprite.position;
        this.player.sprite.moveSpriteTo([ pos[0] - SPEED, pos[1]]);
    };

    moveDown = (sprite) => {
        const pos = sprite.position;
        this.player.sprite.moveSpriteTo([ pos[0], pos[1] + SPEED]);
    };

    moveUp = (sprite) => {
        const pos = sprite.position;
        this.player.sprite.moveSpriteTo([ pos[0], pos[1] - SPEED]);
    };

    isAtBounds = (rect) => {

    }
}