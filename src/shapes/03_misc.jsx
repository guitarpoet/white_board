+(function(){

class Erase extends lilium.widgets.Command {
	constructor(x, y) {
		super('erase');
		this.x = x;
		this.y = y;
		this.width = 20;
		this.height = 20;
	}
}

class Zoom extends lilium.widgets.Command {
	constructor(factor) {
		super('zoom');
		this.factor = factor;
	}
}

class Rotate extends lilium.widgets.Command {
	constructor(angle) {
		super('rotate');
		this.angle = angle;
	}
}

provides([Erase, Zoom, Rotate], 'commands', true);

})();
