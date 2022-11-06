import { database } from "../../index.js";
import { d } from "./Utils.js";

export class Session {
  constructor(name) {
    this.name = name;
    this.executers = {};
  }
  async enter(id, stage = 0, cache, newCache = false) {
    /**
     * @type {DB.User}
     */
    const user = await database.get(d.user(id), true);
    if (!user || typeof user != "object") return;
    user.cache.session = d.session(this.name, stage);
    if (cache)
      newCache
        ? (user.cache.sessionCache = cache)
        : user.cache.sessionCache.push(cache);
    await database.set(d.user(id), user, true);
  }
  async exit(id) {
    /**
     * @type {DB.User}
     */
    const user = await database.get(d.user(id), true);
    if (!user || typeof user != "object") return;
    delete user.cache.session;
    delete user.cache.sessionCache;
    await database.set(d.user(id), user, true);
  }
  /**
   *
   * @param {number} id
   * @param {boolean} [returnUser]
   * @param {DB.User} [CacheUser]
   * @returns {Promise<number | "not" | {user: DB.User; session: number;}>}
   */
  async Q(id, returnUser, CacheUser = null) {
    /**
     * @type {DB.User}
     */
    const user = CacheUser ?? (await database.get(d.user(id), true));
    if (
      !user ||
      typeof user != "object" ||
      !user?.cache?.session?.split ||
      user?.cache?.session?.split("::")[0] != this.name ||
      typeof Number(user?.cache?.session?.split("::")[1]) != "number"
    )
      return "not";
    return returnUser
      ? { user, session: Number(user.cache.session.split("::")[1]) }
      : Number(user.cache.session.split("::")[1]);
  }
  /**
   *
   * @param {number} stage
   * @param {function(FullContext & { message?: { test?: string; caption?: string; }; }, DB.User): void} callback
   */
  next(stage, callback) {
    this.executers[`${stage}`] = callback;
  }
}

/**
 * @type {Object<string, Session>}
 */
export const ssn = {
  OC: new Session("OC"),
};
