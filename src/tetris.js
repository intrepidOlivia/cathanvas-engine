const LINE_HEIGHT = 10;
const RATE_OF_DESCENT = 500;    // milliseconds
const TICK = 10;    // milliseconds

class Tetris {
    constructor(game) {
        this.game = game;
        this.active = null;
        this.activeLocation = null;
        this.field = {
            width: Math.floor(game.canvas.width / LINE_HEIGHT),    // block units
            height: Math.floor(game.canvas.height / LINE_HEIGHT),  // block units
        };
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

    onKeyDown = (e) => {
        if (e.key === ' ') {
            this.active.rotateClockwise();
        }
    };

    doPhysics() {

    }

    render(canvas) {
        this.active.render(canvas);
    }

    /**
     *
     * @param coord [x, y]
     */
    descend(coord) {
        return [coord[0], coord[1] + 1];
    }

    spawnTetromino() {
        this.active = new Tetromino();
        this.active.position = [Math.floor(this.field.width / 2), Math.floor(this.field.height / 2)];
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