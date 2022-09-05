import { database } from "../../index.js";
import { d } from "./formatterCLS.js";

class Session {
  constructor(name) {
    this.name = name;
  }
  async enter(id, stage = 0) {
    /**
     * @type {import("../models.js").DBUser}
     */
    const user = await database.get(d.user(id), true);
    if (!user || typeof user != "object") return;
    user.cache.session = d.session(this.name, stage);
    await database.set(d.user(id), user, true);
  }
  async Q(id) {
    /**
     * @type {import("../models.js").DBUser}
     */
    const user = await database.get(d.user(id), true);
    if (
      !user ||
      typeof user != "object" ||
      !user?.cache?.session?.split ||
      user?.cache?.session?.split("::")[0] != this.name ||
      typeof Number(user?.cache?.session?.split("::")[1]) != "number"
    )
      return "not";
    return Number(user.cache.session.split("::")[1]);
  }
}

export const ssn = {
  OC: new Session("OC"),
};
