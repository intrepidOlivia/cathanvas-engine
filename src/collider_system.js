class Collider {
    /**
     * @param gameObject
     * @param bounds [x1, y1, x2, y2]
     * @param options
     */
    constructor(gameObject, bounds, options = {}) {
        this.bounds = bounds;
        this.rect = new Rect(bounds);
        this.gameObject = gameObject;
    }

    render(canvas) {
        const b = this.bounds;
        canvas.drawRect([b[0], b[1]], this.rect.width, this.rect.height, '#5CB838');
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

                if (newIndex !== this.THIS_TREE) {
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
            if (area.intersects(c.bounds)) {
                outList.push(c);
            }
        });

        return outList;
    }

    /**
     * Internal version of search that iterates on itself to find nodes to search
     * @param area {Rect}
     * @param overlaps  Will be modified in function (Side effects? Maybe we can make this functional)
     * @private
     */
    _search(area, overlaps) {
        this.objects.forEach(o => overlaps.push(o));
        //
        // if (this.objects.length > 0) {
        //     overlaps.push(this.objects);
        // }

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
                this.children[indexNode]._search(area, overlaps);
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
