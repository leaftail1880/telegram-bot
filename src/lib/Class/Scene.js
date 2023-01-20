import { tables } from "../../index.js";
import { d } from "./Utils.js";

export class Scene {
	/**
	 *
	 * @param {string} name
	 */
	constructor(name) {
		this.name = name;
		this.executors = {};
	}
	/**
	 * Entering an user to specified scene
	 * @param {string | number} id
	 * @param {string | number} scene
	 * @param {any} cache
	 * @param {boolean} newCache
	 * @returns {Promise<void>}
	 */
	async enter(id, scene = 0, cache, newCache = false) {
		const user = tables.users.get(id);
		if (!user || typeof user !== "object") return;
		user.cache.scene = d.pn(this.name, scene);
		if (cache) newCache ? (user.cache.sceneCache = cache) : user.cache.sceneCache.push(cache);
		tables.users.set(id, user);
	}
	/**
	 * Deletes all cache and scene info from user with specified id
	 * @param {string | number} id Id of user
	 * @returns {Promise<void>}
	 */
	async exit(id) {
		const user = tables.users.get(id);
		if (!user || typeof user != "object") return;
		delete user.cache.scene;
		delete user.cache.sceneCache;
		tables.users.set(id, user);
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
		if (!("scene" in data) || data.scene.name !== this.name || "group" in data) return false;

		// @ts-expect-error
		return data.scene[type === "number" ? "int_state" : "state"];
	}
	/**
	 * Register the handler for entering specified scene scene
	 * @param {number | string} scene
	 * @param {(ctx: TextMessageContext, data: DB.User) => void} callback
	 */
	next(scene, callback) {
		this.executors[`${scene}`] = callback;
	}
}

export const ssn = {
	OC: new Scene("OC"),
	Art: new Scene("art"),
};

const types = {
	string: String(),
	number: Number(),
};
