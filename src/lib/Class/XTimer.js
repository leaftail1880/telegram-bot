/**
 * @template [MODE=false]
 */
export class XTimer {
	/**
	 * Cooldown time in ms
	 * @type {number}
	 */
	cooldown;
	/**
	 * Last call time
	 * @type {number | Record<string, number>}
	 */
	lastUse;
	/**
	 * Creates a new timer manager
	 * @param {number} cooldown Time in seconds
	 * @param {MODE extends boolean ? MODE : never} [linkMode]
	 */
	constructor(cooldown = 1, linkMode) {
		this.cooldown = cooldown * 1000;
		this.lastUse = linkMode ? Date.now() : {};
	}
	/**
	 * Checks if timer was expired
	 * @param {MODE extends true ? string : never} [key]
	 * @returns
	 */
	isExpired(key) {
		let time;
		const keyIsValid = typeof key === "string" || typeof key === "number" || typeof key === "symbol";

		if (keyIsValid && typeof this.lastUse === "object") {
			// Timer is for key: time type
			time = this.lastUse[key];

			// Timer is for one time type
		} else if (typeof this.lastUse === "number") time = this.lastUse;

		if (Date.now() - time <= this.cooldown) return false;
		this.lastUse = Date.now();
		return true;
	}
}
