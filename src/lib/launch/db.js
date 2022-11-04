export class db {
  constructor() {
    /**
     * @type {import("redis").RedisClientType}
     */
    this.client = null;
    this.log = [];
    this.logAdd("create");
  }
  async close() {
    await this.client.quit();
    delete this.client;
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
      output[key] = Math.round((value / length) * 1000) / 1000;
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
    if (!this.client) throw new SyntaxError("Нет дб");
    const val = await this.getValues((e) => e.startsWith("Cache::log:"));
    return val.map((e) => this.logParse(e));
  }

  async logSave(name = Date.now()) {
    await this.set(`Cache::log:${name}`, this.logFormat(), true);
  }
  /**
   * Запрашивает данные с датабазы
   * @param {string} key
   * @returns {Promise<string | boolean | Object>}
   */
  async get(key, jsonparse = false) {
    if (!this.client) throw new SyntaxError("Нет дб");
    const start = Date.now(),
      value = await this.client.get(key);
    let ret;
    try {
      ret = jsonparse ? JSON.parse(value) : value;
    } catch (error) {
      ret = value;
    }
    this.logAdd("get", start);
    return ret;
  }
  /**
   * Запрашивает данные с датабазы
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async del(key) {
    if (!this.client) throw new SyntaxError("Нет дб");
    const start = Date.now(),
      value = await this.client.del(key);
    this.logAdd("del", start);
    return !!value;
  }
  /**
   * Устанавливает данные в базу данных
   * @param {string} key
   * @param {string | boolean | Object} value
   * @param {boolean} [stringify]
   * @param {number} [lifetime]
   * @returns
   */
  async set(key, value, stringify = false, lifetime) {
    if (!this.client) throw new SyntaxError("Нет дб");
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
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async has(key) {
    if (!this.client) throw new SyntaxError("Нет дб");
    const start = Date.now(),
      boolean = await this.client.exists(key);
    this.logAdd("has", start);
    return !!boolean;
  }
  async add(key, number = 1) {
    if (!this.client) throw new SyntaxError("Нет дб");
    const start = Date.now(),
      result = await this.client.incrBy(key, number);
    this.logAdd("add", start);
    return result;
  }
  async remove(key, number = 1) {
    if (!this.client) throw new SyntaxError("Нет дб");
    const start = Date.now(),
      result = await this.client.decrBy(key, number);
    this.logAdd("remove", start);
    return result;
  }
  /**
   *
   * @param {function} filter
   * @returns
   */
  async keys(filter = () => true) {
    if (!this.client) throw new SyntaxError("Нет дб");
    const start = Date.now(),
      keys = await this.client.keys("*");
    this.logAdd("keys", start);
    return keys.filter((e) => filter(e));
  }
  /**
   *
   * @param {function} filter
   * @returns
   */
  async getValues(filter = () => true) {
    if (!this.client) throw new SyntaxError("Нет дб");
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
   * @returns {Promise<Object<string, object>>}
   */
  async getPairs() {
    if (!this.client) throw new SyntaxError("Нет дб");
    const start = Date.now(),
      collection = {},
      arg = (await this.keys()).sort();
    for (const a of arg) {
      collection[a] = await this.client.get(a);
    }
    this.logAdd("getPairs", start);
    return collection;
  }

  /*
  async (key) {
    if (!this.client) throw new SyntaxError("Нет дб");
    const start = Date.now(), a = await this.client(key);
    this.logAdd('', start);
    return a;
  }
   */
}
