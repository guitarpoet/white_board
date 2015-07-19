+(function(){

var options = {
	color: '#000',
	line_width: 1
};

class Whiteboard extends React.Component {

	constructor() {
		super();
		this.command_stack = [];
	}

	undo() {
		if(this.command_stack.length) {
			this.command_stack.pop();
			this.repaint();
		}
	}

	getCanvas() {
		return React.findDOMNode(this.refs.canvas);
	}

	canvasContext() {
		return this.getCanvas().getContext('2d');
	}

	clear() {
		this.command_stack = [];
		this.repaint();
	}

	repaint() {
		var context = this.context();
		var canvas = this.getCanvas();
	    context.clearRect(0, 0, canvas.width, canvas.height);

        var redraw_stack = this.command_stack;
        this.command_stack = [];
        
		for(let c of redraw_stack) {
			this.execute(c);
		}
	}

	translateOffset(event) {
		var offset = this.getCanvas().getBoundingClientRect();
		var cssx = (event.clientX - offset.left);
		var rel = this.getRelative();
	    var xrel = rel.width;
	    var canvasx = cssx * xrel;

	    var cssy = (event.clientY - offset.top);
	    var yrel = rel.height;
	    var canvasy = cssy * yrel;
		return [canvasx, canvasy];
	}

    getRelative() {
		var canvas = this.getCanvas();
	    return {width: canvas.width / canvas.offsetWidth,
			    height: canvas.height / canvas.offsetHeight};
    }

	execute(command) {
		var context = this.canvasContext();
		this.command_stack.push(command);
		var canvas = this.getCanvas();
		var cw = canvas.width;
		var ch = canvas.height;
		var tmp;

		if (command.canvas !== undefined) { // Draw the old canvas
			context.clearRect(0, 0, canvas.width, canvas.height);
			context.drawImage(command.canvas, 0, 0);
		}

		switch(command.type) {
			case "begin_path":
				context.beginPath();
				context.moveTo(command.x, command.y);
				context.stroke();
				break;
			case "begin_shape":
				context.save();
				context.beginPath();
				break;
			case "draw_path_to_point":
				context.lineTo(command.x, command.y);
				context.stroke();
				break;
			case "close_path":
				context.closePath();
				break;
			case "stroke_color":
				context.strokeStyle = command.color;
				break;
			case "zoom":
				let newWidth = canvas.offsetWidth * command.factor;
				let newHeight = canvas.offsetHeight * command.factor;
				canvas.style.width = newWidth + "px";
				canvas.style.height = newHeight + "px";
				break;
			case "restore":
				context.clearRect(0, 0, cw, ch);
				break;
			case "rotate":
				let radian = command.angle * Math.PI / 180;
				
				// Draw the canvas in to a buffer canvas
				tmp = document.createElement("canvas");
				let tmpcnv = tmp.getContext('2d');
				tmp.width = cw;
				tmp.height = ch;
				tmpcnv.drawImage(canvas, 0, 0);
				
				// Rotate the current canvas
				context.save();
				context.clearRect(0, 0, cw, ch);
				context.translate(cw / 2, ch / 2);
				context.rotate(radian);
				context.translate(-cw / 2,-ch / 2);
				context.drawImage(tmp, 0, 0);
				context.restore();
				
				// Clean up
				tmp = tmpcnv = undefined;
				break;
			case "erase":
				context.clearRect(command.x, command.y, 
					command.width, command.height);
				break;

			case "rectangle":
				tmp = 0;
				if (command.ex < command.sx) {
					tmp = command.sx;
					command.sx = command.ex;
					command.ex = tmp;
				}
				if (command.ey < command.sy) {
					tmp = command.sy;
					command.sy = command.ey;
					command.ey = tmp;
				}
		
				context.beginPath();
				context.rect(command.sx, command.sy, 
					command.ex - command.sx, command.ey - command.sy);
				context.closePath();
				context.stroke();
				break;
			case "oval":
				var kappa = 0.5522848;
				var ox = (command.width / 2) * kappa;
				var oy = (command.height / 2) * kappa;
				var xe = command.x + command.width;
				var ye = command.y + command.height;
				var xm = command.x + command.width / 2;
				var ym = command.y + command.height / 2;
				var x = command.x;
				var y = command.y;
		
				context.beginPath();
				context.moveTo(x, ym);
				context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
				context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
				context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
				context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
				context.closePath();
				context.stroke();
				break;
		}
	}

	changeTool() {
		var canvas = this.getCanvas();
		events.off(canvas);
		canvas.classList.remove('pencil');
		canvas.classList.remove('eraser');
		canvas.classList.remove('rectangle');
		canvas.classList.remove('oval');
	}

	startPencil() {
		this.changeTool();
		var canvas = this.getCanvas();
		canvas.classList.add('pencil');
		events.on(canvas, 'mousedown', (event) => {
			this.beginPencilDraw(event);
		});
	}

	beginPencilDraw(event) {
		var canvas = this.getCanvas();
		var offset = this.translateOffset(event);
		// Start the path draw
		this.execute(new lilium.commands.BeginPath(offset.x, offset.y));

		events.on(canvas, 'mousemove', (event) => {
			let off = this.translateOffset(event);
			this.execute(new lilium.commands.DrawPathToPoint(off[0], off[1]));
		});

		this.offMouseEvents();
	}

	offMouseEvents() {
		var canvas = this.getCanvas();
		events.on(canvas, 'mouseup mouseout', (event) => {
			events.off(canvas, 'mouseup');
			events.off(canvas, 'mouseout');
			events.off(canvas, 'mousemove');
		});
	}

	startEraser() {
		this.changeTool();
		var canvas = this.getCanvas();
		canvas.classList.add('eraser');
		events.on(canvas, 'mousedown', (event) => {
			this.beginErasing(event);
		});
	}

	beginErasing(event) {
		var canvas = this.getCanvas();

		events.on(canvas, 'mousemove', (event) => {
			let off = this.translateOffset(event);
			this.execute(new lilium.commands.Erase(off[0], off[1]));
		});

		this.offMouseEvents();
	}

	startRectangle() {
		this.changeTool();
		var canvas = this.getCanvas();
		canvas.classList.add('rectangle');
		events.on(canvas, 'mousedown', (event) => {
			this.beginRectangleDraw(event);
		});
	}

	beginRectangleDraw(event) {
		var canvas = this.getCanvas();
		var offset = this.translateOffset(event);

		// Create a shadow canvas for store current
        var tmp = document.createElement("canvas");
        var tmpcnv = tmp.getContext('2d');
        tmp.width = canvas.width;
        tmp.height = canvas.height;
        tmpcnv.drawImage(canvas, 0, 0);

		this.execute(new lilium.commands.BeginShape(offset[0], offset[1], tmp));

		events.on(canvas, 'mousemove', (event) => {
			let off = this.translateOffset(event);
			let i = this.command_stack.length - 1;
			while (i >= 0) {
				var e = this.command_stack[i];
				if (e.type === "begin_shape") { // Find the begin point
					var ev = new lilium.commands.Rectangle(e.x, e.y, off[0], off[1], e.canvas);
					this.execute(ev);
					e = ev = undefined;
					break;
				}
				i--;
			}
		});

		this.offMouseEvents();
	}

	startOval() {
		this.changeTool();
		var canvas = this.getCanvas();
		canvas.classList.add('oval');
		events.on(canvas, 'mousedown', (event) => {
			this.beginOvalDraw(event);
		});
	}

	beginOvalDraw(event) {
		var canvas = this.getCanvas();
		var offset = this.translateOffset(event);

		// Create a shadow canvas for store current
        var tmp = document.createElement("canvas");
        var tmpcnv = tmp.getContext('2d');
        tmp.width = canvas.width;
        tmp.height = canvas.height;
        tmpcnv.drawImage(canvas, 0, 0);

		this.execute(new lilium.commands.BeginShape(offset[0], offset[1], tmp));

		events.on(canvas, 'mousemove', (event) => {
			let off = this.translateOffset(event);
			let i = this.command_stack.length - 1;
			while (i >= 0) {
				var e = this.command_stack[i];
				if (e.type === "begin_shape") { // Find the begin point
					var ev = new lilium.commands.Oval(e.x, e.y, off[0] - e.x, off[1] - e.y, e.canvas);
					this.execute(ev);
					e = ev = undefined;
					break;
				}
				i--;
			}
		});

		this.offMouseEvents();
	}
	render() {
		return (<canvas ref="canvas" id={this.props.id} width={this.props.width} 
			height={this.props.height} class={this.props.class}></canvas>);
	}
}

provides([Whiteboard], 'widgets', true);

})();
