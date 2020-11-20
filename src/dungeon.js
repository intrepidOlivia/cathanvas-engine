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
    constructor(containerID, options = {}) {
        super(containerID, options);
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

    startGame() {
        super.startGame();
        this.setColliderTree(this.player.sprite)
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

    moveNext = (collisions) => {
        if (this.nextMove) {
            this.movement[this.nextMove](this.player.sprite);
        }
    };

    doPhysics() {
        const newPos = this.getNewPosition();
        const {sprite} = this.player;
        const newRect = Sprite.getSpriteRect(sprite, newPos);
        if (!this.doesCollide(newRect)) {
            sprite.moveSpriteTo(newPos);

            // Reset collider tree
        }
    }

    setColliderTree = (sprite) => {
        const newTree = new Quadtree();
        this.scene.colliders.forEach(collider => {
            newTree.insert(collider);
        });
        newTree.insert(sprite.rect);
        this.colliderTree = newTree;
    };

    getNewPosition() {
        if (this.nextMove) {
            return this.movement[this.nextMove](this.player.sprite.position);
        }
        return this.player.sprite.position;
    }

    doesCollide = (newRect) => {
        const collisions = this.colliderTree.search(newRect);
        return collisions.length > 0;
    };

    moveRight = (pos) => {
        return [ pos[0] + SPEED, pos[1]]
    };

    moveLeft = pos => {
        return [ pos[0] - SPEED, pos[1]];
    };

    moveDown = (pos) => {
        return [ pos[0], pos[1] + SPEED];
    };

    moveUp = (pos) => {
        return [ pos[0], pos[1] - SPEED];
    };

    isAtBounds = (rect) => {

    }
}

/**
 * Essentially a set of colliders and visuals that establish the setting of the game
 */
class Level {
    constructor() {

    }
}
