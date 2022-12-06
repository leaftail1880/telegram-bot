export class XTimer {
	/**
	 * @type {number}
	 */
	cooldown;
	/**
	 * @type {number}
	 */
	lastUse;
	constructor(cooldown = 1) {
		this.cooldown = cooldown * 1000;
		this.lastUse = Date.now();
	}
	isExpired(time = Date.now(), lastUse = this.lastUse) {
		if (time - lastUse <= this.cooldown) return false;
		this.lastUse = Date.now();
		return true;
	}
}
