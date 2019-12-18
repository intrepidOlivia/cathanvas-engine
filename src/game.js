const NORTH = 'north';
const SOUTH = 'south';
const EAST = 'east';
const WEST = 'west';

const BODY_RADIUS = 5;

class Snake extends CanvasObject {
    constructor(cathanvas, game, options = {}) {
        super();
        this.length = options.length || 5;
        this.bodyLocation = this.initBody(cathanvas);
        this.style = options.style || "#000000";
        this.orientation = 'east';
        this.canvas = cathanvas;
        this.game = game;
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

    doPhysics = () => {
        this.moveSnake();
    };

    moveBodySegment = (coords, orientation) => {
        if (this.isAtBounds(coords, this.canvas)) {
            return;
        }

        switch (orientation) {
            case NORTH:
                return { x: coords.x, y: coords.y - BODY_RADIUS };
                break;
            case EAST:
                return { x: coords.x + BODY_RADIUS, y: coords.y };
                break;
            case SOUTH:
                return { x: coords.x, y: coords.y + BODY_RADIUS};
                break;
            case WEST:
                return { x: coords.x - BODY_RADIUS, y: coords.y };
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
        this.physObjects = [];
        this.TICK = 500;
        this.physicsLoop = null;
    }

    startGame = () => {
        this.snake = new Snake(canvas, this);
        canvas.addRenderObject(this.snake);
        this.addPhysicsObject(this.snake);

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
        this.physicsLoop = setInterval(this.physicsUpdate, this.TICK)
    };

    stopPhysics = () => {
        clearInterval(this.physicsLoop);
        this.physicsLoop = null;
    };

    physicsUpdate = () => {
        this.physObjects.forEach(obj => {
            if (obj.doPhysics) {
                obj.doPhysics()
            }
        });
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

class Collider {
    constructor(gameObject, bounds, options = {}) {
        this.bounds = bounds;
        this.gameObject = gameObject;
    }
}

class Quadtree {
    MAX_NODE_OBJECTS = 5;
    THIS_TREE = -1;
    CHILD_NE = 0;
    CHILD_NW = 1;
    CHILD_SW = 2;
    CHILD_SE = 3;

    constructor(parent=null, level=null, bounds=new Rect([0, 0, 800, 600])) {
        this.parent = parent;
        this.level = level;
        this.bounds = bounds;

        this.objects = [];
        this.children = [];
    }

    insert(collider) {
        let indexNode = null;


        if (this.children.length > 0) {
            // insert into one of the children
            indexNode = this.getIndexNode(collider.bounds);
            if (indexNode != this.THIS_TREE) {
                this.children[indexNode].insert(collider);
                return;
            }
        }

        // insert into this node
        this.objects.push(collider);

        // Check if node needs to split
        if (this.objects.length > this.MAX_NODE_OBJECTS) {
            this.split();

            for (let i = 0; i < this.objects.length; i++) {
                const c = this.objects[i];
                const newIndex = this.getIndexNode(c.bounds);

                if (newIndex != this.THIS_TREE) {
                    this.children[newIndex].insert(c);
                    this.objects[i] = null;
                    // this.objects = this.objects.splice(i, 1);
                }
            }

            this.objects = this.objects.filter(o => o !== null);
        }
    }

    split() {
        const b = this.bounds;

        const childWidth = b.width / 2;
        const childHeight = b.height / 2;

        this.children[this.CHILD_NE] = new Quadtree(this, this.level + 1, new Rect([b.left + childWidth, b.top, b.right, b.top + childHeight]));
        this.children[this.CHILD_NW] = new Quadtree(this, this.level + 1, new Rect([b.left, b.top, b.left + childWidth, b.top + childHeight]));
        this.children[this.CHILD_SW] = new Quadtree(this, this.level + 1, new Rect([b.left, b.top + childHeight, b.left + childWidth, b.bottom]));
        this.children[this.CHILD_SE] = new Quadtree(this, this.level + 1, new Rect([b.left + childWidth, b.top + childHeight, b.right, b.bottom]));
    }

    remove(collider) {
        const indexNode = this.getIndexNode(collider.bounds);

        if (indexNode === this.THIS_TREE || this.children[indexNode] === null) {
            for (let i = 0; i < this.objects.length; i++) {
                const c = this.objects[i];
                if (c.gameObject.instanceId === collider.gameObject.instanceId) {
                    this.objects[i] = null;
                }
            }

            this.objects = this.objects.filter(o => o !== null);
        } else {
            this.children[indexNode].remove(collider);
        }
    }

    /**
     * @param area {Rect}
     * @returns {Array}
     */
    search(area) {
        let possibleOverlaps = [];
        this._search(area, possibleOverlaps);
        const outList = [];

        possibleOverlaps.forEach(c => {
            if (area.intersects(c)) {
                outList.push(c);
            }
        });

        return outList;
    }

    /**
     * Internal version of search that iterates on itself to find nodes to search
     * @param area {Rect}
     * @param overlaps
     * @private
     */
    _search(area, overlaps) {
        overlaps = overlaps.concat(this.objects);

        if (this.children.length > 0 && this.children[0] !== null) {
            const indexNode = this.getIndexNode(area);

            if (indexNode === this.THIS_TREE) {
                for (let i = 0; i < this.children.length; i++) {
                    if (area.intersects(this.children[i].bounds)) {
                    // if (this.children[i].bounds.intersects(area)) {
                        this.children[i]._search(area, overlaps);
                    }
                }
            } else {
                this.children[indexNode].search(area, overlaps);
            }
        }
    }

    /**
     * @param bounds {Rect}
     */
    getIndexNode(objBounds) {
        let index = -1;

        const vertDivide = (this.bounds.left + this.bounds.width) / 2;
        const horizDivide = (this.bounds.top + this.bounds.height) / 2;

        const isNorth = objBounds.top < horizDivide && (objBounds.top + objBounds.height) < horizDivide;
        const isSouth = objBounds.top > horizDivide;
        const isWest = objBounds.left < vertDivide && (objBounds.left + objBounds.width) < vertDivide;
        const isEast = objBounds.left > vertDivide;

        if (isEast) {
            if (isNorth) {
                index = this.CHILD_NE;
            } else if (isSouth) {
                index = this.CHILD_SE;
            }
        } else if (isWest) {
            if (isNorth) {
                index = this.CHILD_NW;
            } else if (isSouth) {
                index = this.CHILD_SW;
            }
        }

        return index;
    }

    clear() {

    }
}
