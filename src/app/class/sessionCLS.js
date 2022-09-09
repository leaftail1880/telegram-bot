import { database } from "../../index.js";
import { d } from "./formatterCLS.js";

export class Session {
  constructor(name) {
    this.name = name;
    this.executers = {}
  }
  async enter(id, stage = 0, cache, newCache = false) {
    /**
     * @type {import("../models.js").DBUser}
     */
    const user = await database.get(d.user(id), true);
    if (!user || typeof user != "object") return;
    user.cache.session = d.session(this.name, stage);
    if (cache) newCache ? user.cache.sessionCache = cache : user.cache.sessionCache.push(cache)
    await database.set(d.user(id), user, true);
  }
  async exit(id) {
    /**
     * @type {import("../models.js").DBUser}
     */
    const user = await database.get(d.user(id), true);
    if (!user || typeof user != "object") return;
    delete user.cache.session
    delete user.cache.sessionCache
    await database.set(d.user(id), user, true);
  }
  async Q(id, returnUser, CacheUser = null) {
    /**
     * @type {import("../models.js").DBUser}
     */
    const user = CacheUser ?? await database.get(d.user(id), true);
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
   * @param {Number} stage 
   * @param {function(Context, DBUser)} callback 
   */
  next(stage, callback) {
    this.executers[`${stage}`] = callback
  }
}

export const ssn = {
  OC: new Session("OC"),
};
