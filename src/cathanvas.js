class Cathanvas {
    constructor(containerID, options = {}) {
        this.container = document.getElementById(containerID);
        this.width = options.width || 800;
        this.height = options.height || 600;
        this.center = {x: this.width / 2, y: this.height / 2};
        this.id = options.id || 'cathanvas';
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.id = this.id;
        this.context = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);
        this.anims = [];
        this.animating = false;
        this.setBackground(options.color, options.bg);
        this.renderCanvas = this.renderCanvas.bind(this);
    }

    setBackground(color, img) {
        if (color) {
            this.bgColor = color;
        }

        if (img) {
            this.bgImg = img;
        }
    }

    /**
     * @param coords [x, y]
     * @param style
     */
    drawDot(coords, style) {
        this.context.fillStyle = style || '#FFFFFF';
        this.context.fillRect(coords[0], coords[1], 1, 1);
    }

    getCurveData(from, to) {
        const curve = {
            totalX: to[0] - from[0],
            totalY: to[1] - from[1],
            centerPoint: [((to[0] - from[0]) / 2) + from[0], ((to[1] - from[1]) / 2) + from[1]],
        };
        curve.radius = (Math.sqrt((curve.totalX * curve.totalX) + (curve.totalY * curve.totalY))) / 2;
        return curve;
    }

    drawCurve(from, to, ccw) {
        // Draw dots from a coord to another coord following an angle
        const curve = this.getCurveData(from, to);
        // Default angle to 360
        for (let i = 0; i < Math.abs(curve.totalX); i++) {
            const nextX = curve.totalX > 0 ? from[0] + i : from[0] - i;
            const ccwMod = ccw ? 1 : -1;
            const nextY = ccwMod * Math.sqrt((curve.radius * curve.radius) - ((nextX - curve.centerPoint[0]) * (nextX - curve.centerPoint[0]))) + curve.centerPoint[1];
            // this.drawLineFrom(curve.centerPoint, [nextX, nextY]);
            this.drawDot([nextX, nextY]);
        }
    }

    drawDotOnCurve(from, to, x, ccw) {
        const curve = this.getCurveData(from, to);
        const ccwMod = ccw ? 1 : -1;
        const y = ccwMod * Math.sqrt((curve.radius * curve.radius) - ((x - curve.centerPoint[0]) * (x - curve.centerPoint[0]))) + curve.centerPoint[1];

        this.drawDot([x, y]);
        // this.drawLineFrom(curve.centerPoint, [x,y]);
    }

    /**
     * @param coords [x, y]
     * @param text
     * @param style
     */
    drawText(coords, text, options = {}) {
        this.context.font = options.style || '1em rgba(0, 0, 0, 0.5) monospace';
        this.context.textAlign = options.textAlign || 'center';
        this.context.fillText(text, coords[0], coords[1]);
    }


    /**
     * @param from [x, y]
     * @param width
     * @param height
     * @param style
     */
    drawRect(from, width, height, style = '#000000') {
        this.context.fillStyle = style;
        this.context.fillRect(from[0], from[1], width, height);
    }

    /**
     *
     * @param {Image} image
     * @param coords [ x, y ]
     * @param options {Object} { dWidth, dHeight, sx, sy, sWidth, sHeight}
     */
    drawImage(image, coords, options = {}) {
        if (!coords) {
            return;
        }

        const { dWidth, dHeight, sx, sy, sWidth, sHeight} = options;

        if (this.areValuesValid([sx, sy, sWidth, sHeight])) {
            this.context.drawImage(image, sx, sy, sWidth, sHeight, coords[0], coords[1], dWidth, dHeight)
            return;
        }

        if (this.areValuesValid([dWidth, dHeight])) {
            this.context.drawImage(image, coords[0], coords[1], dWidth, dHeight);
            return;
        }

        this.context.drawImage(image, coords[0], coords[1]);
    }

    /**
     * Returns true if args are not null or undefined
     * @param args [val1, val2, val3, etc ..]
     * @returns {boolean}
     */
    areValuesValid(args) {
        for (let i = 0; i < args.length; i++) {
            if (args[i] === null || args[i] === undefined) {
                return false;
            }
        }
        return true;
    }

    drawLineFrom(source = [this.center.x, this.center.y], target, style) {
        this.context.strokeStyle = style || '#FFFFFF';
        this.context.moveTo(source[0], source[1]);
        this.context.lineTo(target[0], target[1]);
        this.context.stroke();
    }

    drawLineFromCenter(coords, style) {
        this.context.strokeStyle = style || '#FFFFFF';
        this.context.moveTo(this.center.x, this.center.y);
        this.context.lineTo(coords.x, coords.y);
        this.context.stroke();
    }

    renderCanvas = () => {
        // clear canvas
        this.context.clearRect(0, 0, this.width, this.height);

        // re-populate bg
        this.renderBg();

        // draw animated shapes
        this.anims.forEach(obj => this.draw(obj));

        // restore canvas state
        if (this.animating) {
            requestAnimationFrame(this.renderCanvas);
        }
    };

    renderBg() {
        if (this.bgColor) {
            this.context.fillStyle = this.bgColor;
            this.context.fillRect(0, 0, this.width, this.height);
        }

        if (this.bgImg) {
            this.drawImage(this.bgImg, [0, 0])
        }
    }

    addRenderObject(obj) {
        // Add to animation queue
        this.anims.push(obj)
    }

    removeRenderObject(obj) {
        const s = this.anims.indexOf(a => a === obj);
        if (s) {
            this.anims.splice(s, 1);
        }
    }

    startRendering() {
        this.animating = true;
        requestAnimationFrame(this.renderCanvas);
    }

    stopRendering() {
        this.animating = false;
    }

    draw(obj) {
        if (!obj.render) {
            return;
        }

        obj.render(this);
    }
}

class CanvasObject  {
    render(canvas) {
        console.warn('Please extend the render() method!');
    }
}

class Rect {
    /**
     * @param bounds [x1, y1, x2, y2]
     */
    constructor(bounds) {
        this.bounds = bounds;
        this.left = this.bounds[0];
        this.width = this.bounds[2] - this.bounds[0];
        this.top = this.bounds[1];
        this.height = this.bounds[3] - this.bounds[1];
        this.right = this.bounds[2];
        this.bottom = this.bounds[3];
    }

    /**
     * Written with https://silentmatt.com/rectangle-intersection/ as a guide
     * @param area [x1, y1, x2, y2]
     */
    intersects(area) {
        const b = area.bounds ? area.bounds : area;  // Can't keep straight between rect and coord array

        // Error handling
        if (!b.length || b.length < 4) {
            throw new Error(`Error when calculating intersection with object: ${b.toString()}`);
        }

        let crosses = false;

        let Ax1 = this.bounds[0];
        let Ay1 = this.bounds[1];
        let Ax2 = this.bounds[2];
        let Ay2 = this.bounds[3];

        let Bx1 = b[0];
        let By1 = b[1];
        let Bx2 = b[2];
        let By2 = b[3];

        const bLeftOfA = Bx2 < Ax1;
        const bTopofA = By2 < Ay1;
        const bBelowA = By1 > Ay2;
        const bRightofA = Bx1 > Ax2;

        if (!bRightofA && !bLeftOfA) {
            // Check for vertical intersection
            if (!bTopofA && !bBelowA) {
                crosses = true;
            }
        }

        return crosses;
    }
}

function rectUnitTests() {
    const a = new Rect([180, 20, 500, 220]);
    const b1 = [400, 150, 700, 300];    // should intersect
    const b2 = [5, -30, 270, 100];      // should intersect
    const b3 = [180, 250, 450, 400];    // should not intersect
    const b4 = [530, -100, 750, 50];    // should not intersect

    console.log("Starting unit tests");
    console.assert(a.intersects(b1) === true, "B1");
    console.assert(a.intersects(b2) === true, "B2");
    console.assert(a.intersects(b3) === false, "B3");
    console.assert(a.intersects(b4) === false, "B4");
    console.log("Unit tests complete!");
}

const ANIM_TICK = 200;

class Sprite {
    /**
     * @param spritesheet {HTMLImageElement}
     * @param sliceCoords [ width, height ]
     * @param config {Object} {}
     */
    constructor(spritesheet, sliceCoords, config) {
        this.spritesheet = spritesheet;
        this.width = sliceCoords[0];
        this.height = sliceCoords[1];
        this.config = config;
        this.sprites = [];
        spritesheet.onload = () => {
            this.sprites = this.slice(spritesheet)
        };

        // this.sprites = this.slice(spritesheet);
        this.index = 0;
        this.position = null;
        this.tick = Date.now();
    }

    /**
     * Retrieve a sprite's Rect object at a given position
     * (if position is not provided, will return current Rect)
     * @param sprite
     * @param position
     * @returns {Rect}
     */
    static getSpriteRect(sprite, position) {
        if (position == null) {
            return sprite.rect;
        }

        const wextent = sprite.width / 2;
        const hextent = sprite.height / 2;
        return new Rect([position[0] - wextent, position[1] - hextent, position[0] + wextent, position[1] + hextent]);
    }

    slice(spritesheet) {
        const sprites = [];
        const xframes = Math.ceil(spritesheet.naturalWidth / this.width);
        const yframes = Math.ceil(spritesheet.naturalHeight / this.height);
        for (let i = 0; i < yframes; i++) { // rows
            for (let j = 0; j < xframes; j++) { // columns
                sprites.push([ j * this.width, i * this.height ]);   // [x, y]
            }
        }
        return sprites;
    }

    getCurrentSprite() {
        return this.sprites[this.index];
    }

    incrementAnimation(index, orientation) {
        const min = this.config[orientation][0];
        const max = this.config[orientation][1];
        const i = index + 1;
        if (i > max || i < min) {
            return min;
        }
        return i;
    }

    getRenderPosition() {
        return [
            this.position[0] - (this.width / 2),
            this.position[1] - (this.height / 2),
        ];
    }

    /**
     * @param position
     * @param orientation [OPTIONAL]
     */
    moveSpriteTo(position, orientation) {
        if (orientation) {
            // Just select sprite based on what was passed in
            this.orientation = orientation;
        } else {
            // select sprite based on previous orientation
            if (position !== this.position) {
                this.orientation = this.getOrientation(this.position, position);
                this.animateSprite();
            }
        }

        this.position = position;
        this.rect = Sprite.getSpriteRect(this, position);
    }

    animateSprite = () => {
        const now = Date.now();
        if (now - this.tick > ANIM_TICK) {
            this.index = this.incrementAnimation(this.index, this.orientation);
            this.tick = now;
        }
    };

    getOrientation(prevPos, nextPos) {
        if (prevPos[0] < nextPos[0]) {
            // going right
            return RIGHT;
        }

        if (prevPos[1] < nextPos[1]) {
            // going down
            return DOWN;
        }

        if (prevPos[0] > nextPos[0]) {
            // going left
            return LEFT;
        }

        if (prevPos[1] > nextPos[1]) {
            // going up
            return UP;
        }

        return this.orientation || DOWN;
    }

    render(cathanvas) {
        const sprite = this.getCurrentSprite();
        if (sprite) {
            cathanvas.drawImage(this.spritesheet, this.getRenderPosition(), {
                sx: sprite[0],
                sy: sprite[1],
                sWidth: this.width,
                sHeight: this.height,
                dWidth: this.width,
                dHeight: this.height,
            })
        }
    }
}
