import { DatabaseWrapper } from "leafy-db";
import { DBManager } from "../../index.js";
import { removeDefaults, setDefaults } from "../../lib/utils/defaults.js";
import { DefaultSubs } from "./menu.js";

/**
 * @type {DatabaseWrapper<Settings>}
 */
const SubDB = DBManager.CreateTable("modules/subs.json");

SubDB._.beforeGet = (key, value) => {
	return setDefaults(value, DefaultSubs);
};

SubDB._.beforeSet = (key, value) => {
	return removeDefaults(value, DefaultSubs);
};

/**
 * @typedef {typeof import("./menu.js").DefaultSubs} Settings
 */

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
	 * @param {keyof Settings} key
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
	 * @param {keyof Settings} key
	 * @return {boolean} value
	 */
	q(id, key) {
		const settings = this.get(id);
		return settings[key];
	},
	/**
	 *
	 * @param {keyof Settings} key
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

export class PersonalSubs {
	#id;
	/**
	 *
	 * @param {number} id
	 */
	constructor(id) {
		this.#id = id;
	}
	get() {
		return Subscriptions.get(this.#id);
	}
	/**
	 *
	 * @param {keyof Settings} key
	 * @param {boolean} value
	 */
	set(key, value) {
		return Subscriptions.set(this.#id, key, value);
	}
	/**
	 *
	 * @param {keyof Settings} key
	 * @return {boolean} value
	 */
	q(key) {
		return Subscriptions.q(this.#id, key);
	}
}
