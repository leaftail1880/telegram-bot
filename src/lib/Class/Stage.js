import { database } from "../../index.js";
import { d } from "./Utils.js";

export class Stage {
	/**
	 *
	 * @param {string} name
	 */
	constructor(name) {
		this.name = name;
		this.executers = {};
	}
	/**
	 * Entering an user to specified stage
	 * @param {string | number} id
	 * @param {string | number} stage
	 * @param {any} cache
	 * @param {boolean} newCache
	 * @returns {Promise<void>}
	 */
	async enter(id, stage = 0, cache, newCache = false) {
		/**
		 * @type {DB.User}
		 */
		const user = await database.get(d.user(id), true);
		if (!user || typeof user !== "object") return;
		user.cache.stage = d.stage(this.name, stage);
		if (cache) newCache ? (user.cache.stageCache = cache) : user.cache.stageCache.push(cache);
		await database.set(d.user(id), user);
	}
	/**
	 * Deletes all cache and stage info from user with specified id
	 * @param {string | number} id Id of user
	 * @returns {Promise<void>}
	 */
	async exit(id) {
		/**
		 * @type {DB.User}
		 */
		const user = await database.get(d.user(id), true);
		if (!user || typeof user != "object") return;
		delete user.cache.stage;
		delete user.cache.stageCache;
		await database.set(d.user(id), user);
	}
	/**
	 *
	 * @template {keyof typeof types} S
	 * @param {IEvent.Data} data
	 * @param {S} [type]
	 * @returns {typeof types[S] | false}
	 */
	// @ts-expect-error
	state(data, type = "number") {
		if (!("stage" in data) || data.stage.name !== this.name || "group" in data) return false;

		// @ts-expect-error
		return data.stage[type === "number" ? "int_state" : "state"];
	}
	/**
	 * Register the handler for entering specified scene stage
	 * @param {number | string} stage
	 * @param {(ctx: TextMessageContext, data: DB.User) => void} callback
	 */
	next(stage, callback) {
		this.executers[`${stage}`] = callback;
	}
}

export const ssn = {
	OC: new Stage("OC"),
	Art: new Stage("art"),
};

const types = {
	string: String(),
	number: Number(),
};
