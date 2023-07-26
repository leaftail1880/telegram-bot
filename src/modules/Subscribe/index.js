import { SubDB } from "./db.js";

export const Subscriptions = {
	/**
	 * @param {number} id
	 */
	get(id) {
		return SubDB.get(id);
	},
	/**
	 *
	 * @param {number} id
	 * @param {import("./db.js").SubKey} key
	 * @param {boolean} value
	 */
	set(id, key, value) {
		const { data: settings, save } = SubDB.work(id);
		settings[key] = value;
		save();
	},
	/**
	 *
	 * @param {number} id
	 * @param {import("./db.js").SubKey} key
	 * @return {boolean} value
	 */
	q(id, key) {
		const settings = this.get(id);
		return settings[key];
	},
	/**
	 *
	 * @param {import("./db.js").SubKey} key
	 * @param {number[] | undefined} [IDs]
	 * @param {*} [searchValue]
	 * @returns {number[]}
	 */
	list(key, IDs, searchValue = true) {
		const users = Array.isArray(IDs) ? IDs : SubDB.keys().map(Number);
		const passed = [];

		for (const user of users) {
			const subs = this.get(user);
			if (subs[key] === searchValue) passed.push(user);
		}

		return passed;
	},
};
