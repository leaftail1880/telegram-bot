import { database } from "../../index.js";
import { d } from "./Utils.js";

export class Session {
	/**
	 *
	 * @param {string} name
	 */
	constructor(name) {
		this.name = name;
		this.executers = {};
	}
	/**
	 * Entering an user to specified session
	 * @param {string | number} id
	 * @param {number} stage
	 * @param {any} cache
	 * @param {boolean} newCache
	 * @returns {Promise<void>}
	 */
	async enter(id, stage = 0, cache, newCache = false) {
		/**
		 * @type {DB.User}
		 */
		const user = await database.get(d.user(id), true);
		if (!user || typeof user != "object") return;
		user.cache.session = d.session(this.name, stage);
		if (cache) newCache ? (user.cache.sessionCache = cache) : user.cache.sessionCache.push(cache);
		await database.set(d.user(id), user);
	}
	/**
	 * Deletes all cache and session info from user with specified id
	 * @param {string | number} id Id of user
	 * @returns {Promise<void>}
	 */
	async exit(id) {
		/**
		 * @type {DB.User}
		 */
		const user = await database.get(d.user(id), true);
		if (!user || typeof user != "object") return;
		delete user.cache.session;
		delete user.cache.sessionCache;
		await database.set(d.user(id), user);
	}
	/**
	 * Tests if user is entered special session
	 * @template {boolean} S
	 * @param {number} id
	 * @param {S} [returnUser]
	 * @param {DB.User} [CacheUser]
	 * @returns {Promise<"not" | (S extends true ? {user: DB.User; session: number;} : number)>}
	 */
	async Q(id, returnUser, CacheUser = null) {
		/**
		 * @type {DB.User}
		 */
		const user = CacheUser ?? (await database.get(d.user(id), true));

		const result = user?.cache?.session?.split("::");

		if (!result || result[0] !== this.name) return "not";

		const session = parseInt(result[1]);

		// @ts-expect-error
		return returnUser ? { user, session } : session;
	}
	/**
	 * Register the handler for entering specified scene stage
	 * @param {number} stage
	 * @param {(ctx: TextMessageContext, data: DB.User) => void} callback
	 */
	next(stage, callback) {
		this.executers[`${stage}`] = callback;
	}
}

/**
 * @type {Record<string, Session>}
 */
export const ssn = {
	OC: new Session("OC"),
};
