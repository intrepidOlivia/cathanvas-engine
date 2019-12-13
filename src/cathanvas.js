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