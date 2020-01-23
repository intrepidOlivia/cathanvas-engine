const LINE_HEIGHT = 10;
let RATE_OF_DESCENT = 600;    // milliseconds
const TICK = 10;    // milliseconds
const RIGHT = 'right';
const LEFT = 'left';
const DOWN = 'down';
const BOTTOM = 'bottom';

class Tetris {
    constructor(game) {
        this.game = game;
        this.active = null;
        this.field = {
            width: Math.floor(game.canvas.width / LINE_HEIGHT),    // block units
            height: Math.floor(game.canvas.height / LINE_HEIGHT),  // block units
        };
        this.tickCounter = {
            deltaTime: 0,
            prev: Date.now(),
        };
        this.nextMove = null;
        this.addListeners();
    }

    addListeners = () => {
        window.addEventListener('click', this.onClick);
        window.addEventListener('keydown', this.onKeyDown);
    };

    removeListeners = () => {
        window.removeEventListener('click', this.onClick);
        window.removeEventListener('keydown', this.onKeyDown);
    };

    onClick = () => {
        this.active.rotateClockwise();
    };

    togglePause = () => {
        this.resetDelta();
        this.game.togglePause();
    };

    onKeyDown = (e) => {
        if (e.key === ' ') {
            this.togglePause();
        }

        if (e.key === 'ArrowLeft') {
            this.nextMove = LEFT;
        }

        if (e.key === 'ArrowRight') {
            this.nextMove = RIGHT;
        }

        if (e.key === 'ArrowDown') {
            this.nextMove = DOWN;
        }
    };

    resetDelta = () => {
        this.tickCounter.deltaTime = 0;
        this.tickCounter.prev = Date.now();
    };

    doPhysics() {
        // Check for end of game
        if (this.isAtBounds(BOTTOM)) {
            this.game.endGame();
            return;
        }

        // Control rate of descent
        const now = Date.now();
        this.tickCounter.deltaTime += now - this.tickCounter.prev;
        if (this.tickCounter.deltaTime > RATE_OF_DESCENT) {
            this.resetDelta();
            this.descend();
        }
        this.tickCounter.prev = now;

        // Do rest of player input
        this.moveNext();
    }

    moveNext = () => {
        switch (this.nextMove) {
            case RIGHT:
                this.moveRight();
                break;
            case LEFT:
                this.moveLeft();
                break;
            case DOWN:
                this.descend();
                break;
            default:
                break;
        }
        this.nextMove = null;
    };

    render(canvas) {
        this.active.render(canvas);
    }

    descend() {
        const pos = this.active.position;
        this.active.position = [pos[0], pos[1] + 1];
    }

    moveLeft() {
        if (!this.isAtBounds(LEFT)) {
            const pos = this.active.position;
            this.active.position = [pos[0] - 1, pos[1]];
        }
    }

    moveRight() {
        if (!this.isAtBounds(RIGHT)) {
            const pos = this.active.position;
            this.active.position = [pos[0] + 1, pos[1]]
        }
    }

    spawnTetromino() {
        this.active = new Tetromino();
        this.active.position = [Math.floor(this.field.width / 2), Math.floor(this.field.height / 2)];
    }

    isAtBounds(whichBound) {
        const shapePosition = this.active.getShapeBounds();
        const leftBound = new Rect([0 - this.field.width, 0 - this.field.height, 0, this.field.height]);   // left
        const rightBound = new Rect([this.field.width, 0, this.field.width * 2, this.field.height]);   // right
        const bottomBound = new Rect([0, this.field.height, this.field.width, this.field.height * 2]);

        switch (whichBound) {
            case LEFT:
                return shapePosition.intersects(leftBound);
            case RIGHT:
                return shapePosition.intersects(rightBound);
            case BOTTOM:
                return shapePosition.intersects(bottomBound);
            default:
                break;
        }

        if (!whichBound) {
            const allBounds = [leftBound, rightBound, bottomBound];
            for (let i = 0; i < allBounds.length; i++) {
                const bound = allBounds[i];
                if (bound.intersects(shapePosition)) {
                    return true;
                }
            }
        }

        return false;
    }
}

class Tetromino {
    position = [0, 0];   // block units [x, y]
    rotation = 0;

    constructor(type) {
        if (type) {
            this.shape = type;
        } else {
            this.shape = this.selectRandomShape();
        }

        if (this.shape === 'tee') {
            this.rotation = -90;
        }
    }

    getShapeBounds = () => {
        const pos = this.position;
        const topLeft = [pos[0], pos[1]]
        const bottomRight = [pos[0] + this[this.shape][0].length, pos[1] + this[this.shape].length];
        return new Rect([topLeft[0], topLeft[1], bottomRight[0], bottomRight[1]]);
    };

    render(canvas) {
        let cursor = [this.position[0] * LINE_HEIGHT, this.position[1] * LINE_HEIGHT];  // cursor is canvas position, not field position
        this[this.shape].forEach(coords => {
            for (let i = 0; i < coords.length; i++) {
                if (coords[i] > 0) {
                    canvas.drawRect(cursor, LINE_HEIGHT, LINE_HEIGHT);
                }
                cursor[0] += LINE_HEIGHT;
            }
            cursor[0] = this.position[0] * LINE_HEIGHT;
            cursor[1] += LINE_HEIGHT;
        });
    }

    selectRandomShape() {
        const rand = Math.floor(Math.random() * 5);
        switch (rand) {
            case 0:
                return 'square';
            case 1:
                return 'elR';
            case 2:
                return 'elL';
            case 3:
                return 'tee';
            case 4:
                return 'long';
        }
    }

    rotateClockwise() {
        let oldRows = this[this.shape].length;
        let oldCols = this[this.shape][0].length;

        let newRows = oldCols;
        let newCols = oldRows;

        const rotated = [];

        let c = 0;
        for (let i = 0; i < newRows; i++) {
            rotated[i] = [];
            let r = oldRows - 1;
            for (let j = 0; j < newCols; j++) {
                rotated[i][j] = this[this.shape][r][c];
                r--;
            }
            c++;
        }

        this[this.shape] = rotated;
    }

    square = [
        [1, 1],
        [1, 1],
    ];

    elR = [
        [1, 0],
        [1, 0],
        [1, 1],
    ];

    elL = [
        [0, 1],
        [0, 1],
        [1, 1],
    ];

    tee = [
        [0, 1, 0],
        [1, 1, 1],
    ];

    long = [
        [1],
        [1],
        [1],
        [1],
    ];
}

// COPIED STRAIGHT FROM FRACTAL-PRACTICE, UNREVISED
class Matrix {
    /**
     *
     * @param vector [[x y], [x, y]]
     * @param modifier [x, y]
     */
    translate(vector, modifier) {
        return vector.map(coord => [
            coord[0] + modifier[0],
            coord[1] + modifier[1]
        ]);
    }

    rotateClockwise(vector, angle=90) {
        // TODO: make vector diagonal?
        const offset = [-vector[0][0], -vector[0][1]];


        for (let i = 0; i < vector.length - 1; i += 2) {
            // Move to center
            let v = translate([vector[i], vector[i + 1]], offset);
            v = transpose(v);	// transpose x and y

            // Rotate around origin
            const product = dotProduct(R, v);

            // Move back to location
            v = transpose(translate(product, [-offset[0], -offset[1]]));

            // Reassign value
            vector[i] = v[0];
            vector[i + 1] = v[1];
        }
        return vector;
    }

    /**
     * [[x, y], [x, y]] -> [[x, x],[y, y]]
     * [[x, x],[y, y]] -> [[x, y],[x, y]]
     * @param v
     */
    transpose(v) {
        return [[v[0][0], v[1][0]], [v[0][1], v[1][1]]];
    }

// [ x1, y1 ]
// [ x2, y2 ]
// NOTE: This function only works for two-column source, two-row target.
    dotProduct(source, target, rows) {
        if (source.length !== target.length) {
            console.error("Cannot perform dot product of unequal count", source, target);
            throw new Error ("Cannot perform dot product of unequal count");
        }

        const v1 = [];
        const v2 = [];

        v1.push((source[0][0] * target[0][0]) + (source[0][1] * target[1][0]));
        v1.push((source[0][0] * target[0][1]) + (source[0][1] * target[1][1]))

        v2.push((source[1][0] * target[0][0]) + (source[1][1] * target[1][0]));
        v2.push((source[1][0] * target[0][1]) + (source[1][1] * target[1][1]))

        return [v1, v2];
    }
}