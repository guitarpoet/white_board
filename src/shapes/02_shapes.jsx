+(function(){

class BeginShape extends lilium.widgets.Command {
	constructor(x, y, canvas) {
		super('begin_shape');
		this.x = x;
		this.y = y;
		this.canvas = canvas;
	}
}

class Rectangle extends lilium.widgets.Command {
	constructor(sx, sy, ex, ey, canvas) {
		super('rectangle');
		this.sx = sx;
		this.sy = sy;
		this.ex = ex;
		this.ey = ey;
		this.canvas = canvas;
	}
}

class Oval extends lilium.widgets.Command {
	constructor(x, y, width, height, canvas) {
		super('oval');
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.canvas = canvas;
	}
}

provides([BeginShape, Rectangle, Oval], 'commands', true);

})();
