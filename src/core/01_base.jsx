+(function(){

/**
 * The base class for all the commands
 */
class Command {
	constructor(type) {
		this.type = type;
		this.time = new Date().getTime();
	}
}

provides([Command], 'widgets', true);
})();
