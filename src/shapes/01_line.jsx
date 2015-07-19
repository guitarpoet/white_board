+(function(){

class BeginPath extends lilium.widgets.Command {
	constructor(x, y) {
		super('begin_path');
		this.x = x;
		this.y = y;
	}
}

class ClosePath extends lilium.widgets.Command {
	constructor() {
		super('close_path');
	}
}

class StrokeColor extends lilium.widgets.Command {
	constructor(color) {
		super('stroke_color');
		this.color = color;
	}
}

class StrokeStyle extends lilium.widgets.Command {
	constructor(style) {
		super('stroke_style');
		this.style = style;
	}
}

class StrokeWidth extends lilium.widgets.Command {
	constructor(width) {
		super('stroke_width');
		this.width = width;
	}
}

class DrawPathToPoint extends lilium.widgets.Command {
	constructor(x, y) {
		super('draw_path_to_point');
		this.x = x;
		this.y = y;
	}
}

provides([BeginPath, ClosePath, StrokeColor, StrokeStyle, StrokeWidth,
	DrawPathToPoint], 'commands', true);

})();
