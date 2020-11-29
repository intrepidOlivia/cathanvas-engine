class SetVisualizer extends Game {
    /**
     * @param {Cathanvas} cathanvas
     */
    constructor(cathanvas, set = [], options = {}) {
        super(cathanvas);
        this.cathanvas = cathanvas;
        this.center = this.cathanvas.center;
        this.set = set;
        this.range = this.determineNumRange(options);
        this.offset = {
            x: (num) => num * this.resolution,
            y: (num) => (-1 * num * this.resolution) + (this.cathanvas.height / 2)
        };
        this.FPS = options.FPS == null ? 12 : options.FPS;
        this.circleCursor = 1;
        this.pointCursor = 0;
        this.time = Date.now();
        this.color = [255, 0, 0];
        this.colorPhase = 0;
        this.colorChangeRate = options.colorChangeRate || 10;
    }

    determineNumRange(options) {
        const res = options.resolution || 1;   // How many units are on the screen
        this.resolution = res;
        return this.cathanvas.width / res;
    }

    drawNumberLine() {
        this.cathanvas.drawLineFrom([0, cathanvas.height / 2], [cathanvas.width, cathanvas.height / 2]);
        this.drawTicks();
    }

    drawTicks() {
        const tickLength = 0.0005 * this.cathanvas.height;
        for (let i = 0; i < this.range; i++) {
            this.cathanvas.drawLineFrom(this.applyOffset([i, -tickLength]), this.applyOffset([i, tickLength]));
        }
    }

    drawSet() {
        let prev = null;
        for (let i = 0; i < this.set.length; i++) {
            if (prev) {
                this.drawSemiCircle(this.applyOffset([prev, 0]), this.applyOffset([this.set[i], 0]), i % 2 !== 0);
            }
            prev = this.set[i];
        }
    }

    withinRateLimit() {
        if (this.FPS <= 0) {
            return true;
        }
        const timeDelta = Date.now() - this.time;
        if (timeDelta > (1 / this.FPS) * 1000) {
            this.time = Date.now();
            return true;
        }
        return false;
    }

    drawNextDot() {
        if (!this.withinRateLimit()) {
            return;
        }

        const i = this.circleCursor;  // semicircles
        if (i < this.set.length && this.set[i - 1] != null) {
            const j = this.pointCursor; // points on semicircle
            if (this.set[i] === j / this.resolution) { // If the animation has reached the next point on the line
                this.circleCursor += 1;
            } else {
                const fromX = this.set[i - 1];
                const toX = this.set[i];

                this.cathanvas.drawDotOnCurve(this.applyOffset([fromX, 0]), this.applyOffset([toX, 0]), j, i % 2 !== 0);
                this.pointCursor = getNextX(fromX * this.resolution, toX * this.resolution, j);
            }
        }
    }

    drawNextSemicircle() {
        if (!this.withinRateLimit()) {
            return true;
        }

        const i = this.circleCursor;
        if (i >= this.set.length) {
            return false;
        }

        const from = [this.set[i - 1], 0];
        const to = [this.set[i], 0];
        if (i < this.set.length && from[0] != null) {
            if (this.withinRenderRange(from) || this.withinRenderRange(to)) {
                this.drawSemiCircle(this.applyOffset(from), this.applyOffset(to), i % 2 !== 0);
            }
        }
        this.circleCursor += 1;
        return true;
    }

    animateSet() {
        requestAnimationFrame(() => {
            if (this.drawNextSemicircle()) {
                requestAnimationFrame(() => this.animateSet());
            }
        });
    }

    startAnimating() {
        this.circleCursor = 1;
        this.animateSet();
    }

    stopAnimating() {
        this.circleCursor = this.set.length + 1;
    }

    drawSemiCircle(pointA, pointB, ccw) {
        this.cathanvas.drawSemicircle(pointA, pointB, ccw, this.getColorString());
        this.adjustColor();
        // this.cathanvas.drawCurve(this.applyOffset(pointA), this.applyOffset(pointB), { ccw});
    }

    withinRenderRange([x, y]) {
        return x > 0 && x <= this.range;
    }

    numberWithinRange(num) {
        return num >= 0 && num <= this.range;
    }

    getColorString() {
        return `rgb(${this.color.join(',')})`;
    }

    adjustColor() {
        let colorIndex, modifier;

        switch (this.colorPhase) {
            case 0:
                colorIndex = 1;
                modifier = 1;
                break;
            case 1:
                colorIndex = 0;
                modifier = -1;
                break;
            case 2:
                colorIndex = 2;
                modifier = 1;
                break;
            case 3:
                colorIndex = 1;
                modifier = -1;
                break;
            case 4:
                colorIndex = 0;
                modifier = 1;
                break;
            case 5:
                colorIndex = 2;
                modifier = -1;
                break;
            default:
                break;
        }

        this.color[colorIndex] += modifier * this.colorChangeRate;
        if (this.color[colorIndex] >= 255 || this.color[colorIndex] <= 0) {
            this.colorPhase += 1;
            if (this.colorPhase > 5) {
                this.colorPhase = 0;
            }
        }
        if (this.color[colorIndex] > 255) {
            this.color[colorIndex] = 255;
        }
        if (this.color[colorIndex] < 0) {
            this.color[colorIndex] = 0;
        }
    }

    applyOffset(coords) {
        // Place the coordinate on the display coord system rather than the Canvas coord system
        const mappedCoords = [];
        if (this.offset.x) {
            mappedCoords.push(this.offset.x(coords[0]));
        } else {
            mappedCoords.push(coords[0]);
        }
        if (this.offset.y) {
            mappedCoords.push(this.offset.y(coords[1]));
        } else {
            mappedCoords.push(coords[1]);
        }
        return mappedCoords;
    }

    saveImage() {
        const data = this.cathanvas.canvas.toDataURL("application/octet-stream");
        const saveLink = document.getElementById("saveLink");
        saveLink.href = data;
    }
}

/**
 *
 * @param {Number} from
 * @param {Number} to
 * @param {Number} current
 */
function getNextX(from, to, current) {
    if (to < from) {
        return current - 1;
    }
    return current + 1;
}

function generateRecaman(length) {
    /** Recamán's sequence (or Recaman's sequence):
     * a(0) = 0; for n > 0,
     *
     * a(n) = a(n-1) - n if nonnegative and not already in the sequence,
     *
     * otherwise a(n) = a(n-1) + n.
     */

    const setNums = new Set();
    setNums.add(0);
    const set = [0];

    for (let i = 1; i < length; i++) {
        const proposed = set[i - 1] - i;
        if (proposed > 0 && !setNums.has(proposed)) {
            set[i] = proposed;
            setNums.add(proposed);
        } else {
            const alt = set[i-1] + i;
            set[i] = alt;
            setNums.add(alt);
        }
    }
    return set;
}

function generateFibonacci(length) {
    /**
     * 	Fibonacci numbers: F(n) = F(n-1) + F(n-2) with F(0) = 0 and F(1) = 1.
     */
    const set = [0, 1];
    for (let i = 2; i < length; i++) {
        set.push(set[i-1] + set[i-2]);
    }
    return set;
}

