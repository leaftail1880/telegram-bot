export class db {
  constructor() {
    /**
     * @type {import("redis").RedisClientType}
     */
    this.client = null;
    this.log = [];
    this.logAdd("create");
  }
  setClient(c, ms) {
    this.client = c;
    this.logAdd("connect", ms);
  }
  logAdd(msg = "</>", startMS = Date.now(), dopmsg = null) {
    const push = {
      msg: msg,
      time: Date.now() - startMS,
      dopmsg: dopmsg,
    };
    this.log.push(push);
  }
  async logGetAverageOperationsTime(oldLogs = true) {
    let logs = this.log,
      output = {};
    if (oldLogs) {
      try {
        const a = await this.logGetFromCache();
        a.forEach((e) => logs.push(e));
      } catch (error) {
        console.warn(error);
      }
    }
    logs.forEach((e) => {
      delete e.start;
      delete e.end;
    });
    for (const log of logs) {
      if (!output[log.msg]) output[log.msg] = [];
      output[log.msg].push(log.time);
    }
    for (const key of Object.keys(output)) {
      let value = 0,
        length = output[key].length;
      output[key].forEach((e) => {
        value = value + e;
      });
      output[key] = value / length;
    }
    return output;
  }
  logFormat(prefix = "db") {
    this.logAdd("logFormat");
    return this.log.map(
      (e) =>
        `[${prefix}] ${e.msg} ${e.time > 0 ? e.time + " ms" : ""} ${
          e.dopmsg ? e.dopmsg : ""
        }`
    );
  }

  logParse(logString) {
    return {
      msg: logString.split(" ")[1],
      time: Number(logString.split(" ")[2]),
    };
  }
  async logGetFromCache() {
    if (!this.client) throw new Error("Нет дб");
    const val = await this.getValues((e) => e.startsWith("cache::log:"));
    return val.map((e) => this.logParse(e));
  }

  async logSave(name = Date.now()) {
    await this.set(`cache::log:${name}`, this.logFormat(), true);
  }
  /**
   * Запрашивает данные с датабазы
   * @param {String} key
   * @returns {Promise<String | Boolean | Object>}
   */
  async get(key, jsonparse = false) {
    if (!this.client) throw new Error("Нет дб");
    const start = Date.now(),
      value = await this.client.get(key);
    this.logAdd("get", start);
    return jsonparse ? JSON.parse(value) : value;
  }
  /**
   * Запрашивает данные с датабазы
   * @param {String} key
   * @returns {Promise<Boolean>}
   */
  async del(key) {
    if (!this.client) throw new Error("Нет дб");
    const start = Date.now(),
      value = await this.client.del(key);
    this.logAdd("del", start);
    return value;
  }
  /**
   * Устанавливает данные в базу данных
   * @param {String} key
   * @param {String | Boolean | Object} value
   * @returns
   */
  async set(key, value, stringify = false, lifetime) {
    if (!this.client) throw new Error("Нет дб");
    const start = Date.now();
    await this.client.set(
      key,
      typeof value == "string"
        ? value
        : stringify
        ? JSON.stringify(value)
        : value
    );
    if (typeof lifetime == "number") this.client.expire(key, lifetime);
    this.logAdd("set", start);
    return value;
  }
  /**
   * @param {String} key
   * @returns {Promise<Boolean>}
   */
  async has(key) {
    if (!this.client) throw new Error("Нет дб");
    const start = Date.now(),
      boolean = await this.client.exists(key);
    this.logAdd("has", start);
    return boolean;
  }
  async add(key, number = 1) {
    if (!this.client) throw new Error("Нет дб");
    const start = Date.now(),
      result = await this.client.incrBy(key, number);
    this.logAdd("add", start);
    return result;
  }
  async remove(key, number = 1) {
    if (!this.client) throw new Error("Нет дб");
    const start = Date.now(),
      result = await this.client.decrBy(key, number);
    this.logAdd("remove", start);
    return result;
  }
  async keys(filter = () => true) {
    if (!this.client) throw new Error("Нет дб");
    const start = Date.now(),
      keys = await this.client.keys("*");
    this.logAdd("keys", start);
    return keys.filter((e) => filter(e));
  }
  async getValues(filter = () => true) {
    if (!this.client) throw new Error("Нет дб");
    const start = Date.now(),
      collection = [],
      keys = await this.keys();
    for (const a of keys.filter((e) => filter(e))) {
      collection.push(await this.client.get(a));
    }
    this.logAdd("getValues", start);
    return collection;
  }
  /**
   *
   * @returns {Object<String, Object>}
   */
  async getPairs() {
    if (!this.client) throw new Error("Нет дб");
    const start = Date.now(),
      collection = {},
      arg = await this.keys();
    for (const a of arg) {
      collection[a] = await this.client.get(a);
    }
    this.logAdd("getPairs", start);
    return collection;
  }

  /*
  async (key) {
    if (!this.client) throw new Error("Нет дб");
    const start = Date.now(), a = await this.client(key);
    this.logAdd('', start);
    return a;
  }
   */
}
