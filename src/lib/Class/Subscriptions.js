import { database } from "../../index.js";
import { $PREFIX, DefaultSubs } from "../../modules/Subscribe/menu.js";
import { setDefaults } from "../utils/defaults.js";
import { d } from "./Utils.js";

/**
 * @typedef {typeof import("../../modules/Subscribe/menu.js").DefaultSubs} Settings
 */

export const Subscriptions = {
	/**
	 *
	 * @param {number | "*"} id
	 * @returns
	 */
	keyLink(id) {
		return d.pn($PREFIX, id);
	},
	/**
	 *
	 * @param {number} id
	 * @return {Promise<Settings>}
	 */
	async get(id) {
		const link = this.keyLink(id);
		return setDefaults(await database.get(link), DefaultSubs);
	},
	/**
	 *
	 * @param {number} id
	 * @param {keyof Settings} key
	 * @param {boolean} value
	 */
	async set(id, key, value) {
		const settings = await this.get(id);
		settings[key] = value;
		database.set(this.keyLink(id), settings);
	},
	/**
	 *
	 * @param {number} id
	 * @param {keyof Settings} key
	 * @return {Promise<boolean>} value
	 */
	async q(id, key) {
		const settings = await this.get(id);
		return settings[key];
	},
	/**
	 *
	 * @param {keyof Settings} key
	 * @param {number[] | undefined} [IDs]
	 * @param {*} [searchValue]
	 * @returns {Promise<number[]>}
	 */
	async list(key, IDs, searchValue = true) {
		const users = Array.isArray(IDs)
			? IDs
			: (await database.keysAsync(this.keyLink("*"))).map((e) => Number(e.split("::")[1]));

		const passed = [];

		for (const user of users) {
			const subs = await this.get(user);
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
	get link() {
		return Subscriptions.keyLink(this.#id);
	}
	async get() {
		return Subscriptions.get(this.#id);
	}
	/**
	 *
	 * @param {keyof Settings} key
	 * @param {boolean} value
	 */
	async set(key, value) {
		return Subscriptions.set(this.#id, key, value);
	}
	/**
	 *
	 * @param {keyof Settings} key
	 * @return {Promise<boolean>} value
	 */
	async q(key) {
		return Subscriptions.q(this.#id, key);
	}
}
