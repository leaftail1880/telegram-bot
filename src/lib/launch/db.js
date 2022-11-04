/**
 * @typedef {import("redis").RedisClientType} cli
 */

/**
 * @typedef {{type: string, time: number}} logEl
 */

export class db {
  /**
   * @type {cli}
   */
  #cli;
  y = {
    close: this.#close.bind(this),
    connect: this.#connect.bind(this),
    time: performance.now(),
  };

  constructor() {
    this.log = new logger(this);
    this.log.write("create");
  }
  get client() {
    this.y.time = performance.now();
    const cli = this.#cli;
    if (!cli) throw new Error("DBClient doesnt exist");
    return cli;
  }
  async #close() {
    await this.client.quit();
    // @ts-ignore
    this.#cli = false;
  }
  async #connect(c, ms) {
    await c.connect();
    this.#cli = c;
    this.log.write("connect", ms);
  }

  /**
   * Запрашивает данные с датабазы
   * @param {string} key
   * @returns {Promise<string | boolean | Object>}
   */
  async get(key, jsonparse = false) {
    const value = await this.client.get(key);
    let ret;
    try {
      ret = jsonparse ? JSON.parse(value) : value;
    } catch (error) {
      ret = value;
    }
    this.log.write("get");
    return ret;
  }
  /**
   * Запрашивает данные с датабазы
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async del(key) {
    const value = await this.client.del(key);
    this.log.write("del");
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
    await this.client.set(
      key,
      typeof value === "string"
        ? value
        : stringify
        ? JSON.stringify(value)
        : value
    );
    if (typeof lifetime === "number") this.client.expire(key, lifetime);
    this.log.write("set");
    return value;
  }
  /**
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async has(key) {
    const boolean = await this.client.exists(key);
    this.log.write("has");
    return !!boolean;
  }
  async add(key, number = 1) {
    const result = await this.client.incrBy(key, number);
    this.log.write("add");
    return result;
  }
  async remove(key, number = 1) {
    const result = await this.client.decrBy(key, number);
    this.log.write("remove");
    return result;
  }
  async keys(filter = "*") {
    const keys = await this.client.keys(filter);
    this.log.write("keys");
    return keys;
  }
  async values(filter = "*") {
    const collection = [];
    const keys = await this.keys(filter);
    for (const a of keys) {
      collection.push(await this.client.get(a));
    }
    this.log.write("getValues");
    return collection;
  }
  /**
   *
   * @returns {Promise<Object<string, object>>}
   */
  async pairs() {
    const start = performance.now();
    const collection = {};
    const arg = (await this.keys()).sort();

    for (const a of arg) {
      collection[a] = await this.client.get(a);
    }
    this.log.write("getPairs");
    return collection;
  }
}

class logger {
  /**
   * @type {logEl[]}
   */
  log = [];
  /**
   *
   * @param {db} parent
   */
  constructor(parent) {
    this.parent = parent;
  }
  write(type = "</>", time) {
    const push = {
      type: type,
      time: performance.now() - (time ?? this.parent.y.time),
    };
    this.log.push(push);
  }
  async averageTime(oldLogs = true) {
    let logs = this.log,
      output = {};
    if (oldLogs) {
      try {
        const a = await this.cachedLog();
        a.forEach((e) => logs.push(e));
      } catch (error) {
        console.warn(error);
      }
    }
    for (const log of logs) {
      output[log.type] = output[log.type] || [];
      output[log.type].push(log.time);
    }
    for (const key of Object.keys(output)) {
      let value = 0;
      const length = output[key].length;
      output[key].forEach((e) => (value = value + e));
      output[key] = Math.round(value / length).toFixed(3);
    }
    return output;
  }
  format() {
    this.write("format");
    return this.log.map((e) => `${e.type} ${e.time > 0 ? e.time + " ms" : ""}`);
  }
  parse(log) {
    return {
      type: log.split(" ")[1],
      time: Number(log.split(" ")[2]),
    };
  }
  async cachedLog() {
    const val = await this.parent.values("Cache::log:*");
    return val.map((e) => this.parse(e));
  }
  async save(name = performance.now()) {
    await this.parent.set(`Cache::log:${name}`, this.format(), true);
  }
}
