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
        this.renderCanvas = this.renderCanvas.bind(this);
    }

    /**
     * @param coords [x, y]
     * @param style
     */
    drawDot(coords, style) {
        this.context.fillStyle = style || '#FFFFFF';
        this.context.fillRect(coords[0], coords[1], 1, 1);
    }

    /**
     * @param from [x, y]
     * @param width
     * @param height
     * @param style
     */
    drawRect(from, width, height, style = '000000') {
        this.context.fillStyle = style;
        this.context.fillRect(from[0], from[1], width, height);
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
        this.context.fillStyle = '#99b7e8';
        this.context.fillRect(0, 0, this.width, this.height);

        // draw animated shapes
        this.anims.forEach(obj => this.draw(obj));

        // restore canvas state
        if (this.animating) {
            requestAnimationFrame(this.renderCanvas);
        }
    };

    addRenderObject(obj) {
        // Add to animation queue
        this.anims.push(obj)
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

        obj.render(canvas);
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
        // Error handling
        if (!area.length || area.length < 4) {
            throw new Error(`Error when calculating intersection with object: ${b.toString()}`);
        }

        let crosses = false;

        let Ax1 = this.bounds[0];
        let Ay1 = this.bounds[1];
        let Ax2 = this.bounds[2];
        let Ay2 = this.bounds[3];

        let Bx1 = area[0];
        let By1 = area[1];
        let Bx2 = area[2];
        let By2 = area[3];

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