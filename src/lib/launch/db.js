import config from "../../config.js";

/**
 * @typedef {import("redis").RedisClientType} cli
 */

/**
 * @typedef {{type: string, time: number}} logObj
 */

export class RedisDatabase {
  /**
   * @type {cli | 'closed'}
   */
  #cli = "closed";
  /**
   * @type {cli | 'closed'}
   */
  #closedcli = "closed";
  _ = {
    /**
     * @type {() => Promise<void>}
     */
    close: this.#close.bind(this),
    /**
     * @type {(client: object, ms: number) => Promise<void>}
     */
    connect: this.#connect.bind(this),
    time: performance.now(),
  };
  cache = new CachedDB(this);
  log = new Logger(this);

  constructor() {
    this.log.write("create");
  }
  get client() {
    this._.time = performance.now();
    if (this.#cli === "closed") throw new Error("DBClient closed");
    return this.#cli;
  }
  async #close() {
    await this.client.quit();
    [this.#closedcli, this.#cli] = [this.#cli, this.#closedcli];
  }
  async #connect(c, ms = Date.now()) {
    if (c) {
      await c.connect();
      this.#cli = c;
    } else if (this.#closedcli !== "closed") {
      [this.#closedcli, this.#cli] = [this.#cli, this.#closedcli];
    }

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
    this.cache.set(key, ret);
    this.log.write("get");
    return ret;
  }
  /**
   * Запрашивает данные с датабазы
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async delete(key) {
    const value = await this.client.del(key);
    this.cache.del(key);
    this.log.write("delete");
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
    this.cache.set(key, value);
    const v$ =
      typeof value === "string"
        ? value
        : stringify
        ? JSON.stringify(value)
        : value;

    await this.client.set(key, v$);
    if (typeof lifetime === "number") this.client.expire(key, lifetime);
    this.log.write("set");
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
  async increase(key, number = 1) {
    const result = await this.client.incrBy(key, number);
    this.cache.set(key, result);
    this.log.write("increase");
    return result;
  }
  async decrease(key, number = 1) {
    const result = await this.client.decrBy(key, number);
    this.cache.set(key, result);
    this.log.write("decrease");
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
    this.log.write("values");
    return collection;
  }
  /**
   *
   * @returns {Promise<Object<string, object>>}
   */
  async pairs() {
    const collection = {};
    const arg = (await this.keys()).sort();

    for (const a of arg) {
      collection[a] = await this.client.get(a);
    }
    this.log.write("pairs");
    return collection;
  }
}

class Logger {
  /**
   * @type {logObj[]}
   */
  log = [];
  #parent;
  /**
   *
   * @param {RedisDatabase} parent
   */
  constructor(parent) {
    this.#parent = parent;
  }
  write(type = "</>", time) {
    const push = {
      type: type,
      time: performance.now() - (time ?? this.#parent._.time),
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
    const val = await this.#parent.values("Cache::log:*");
    return val.map((e) => this.parse(e));
  }
  async save(name = performance.now()) {
    await this.#parent.set(`Cache::log:${name}`, this.format(), true);
  }
}

class CachedDB {
  /**
   * @type {Record<string, {getDate: number; value: any}>}
   */
  #cache = {};
  #parent;

  /**
   *
   * @param {RedisDatabase} parent
   */
  constructor(parent) {
    this.#parent = parent;
  }
  /**
   *
   * @param {string} key
   * @returns
   */
  tryget(key) {
    return this.#getter(key);
  }
  /**
   *
   * @param {string} key
   * @returns {Promise<Object | string | number | undefined | boolean>}
   */
  async get(key) {
    return this.#getter(key, true);
  }
  /**
   *
   * @param {string} key
   * @param {boolean} [alwaysReturn]
   * @returns
   */
  #getter(key, alwaysReturn) {
    if (this.#cache[key]) {
      const c = this.#cache[key];
      if (Date.now() - c.getDate <= config.cache.updateTime) {
        return c.value;
      } else {
        delete this.#cache[key];
      }
    }

    if (alwaysReturn) return this.#parent.get(key, true);
  }
  /**
   *
   * @param {string} key
   * @param {any} value
   * @returns
   */
  set(key, value) {
    this.#cache[key] = {
      getDate: Date.now(),
      value: value,
    };
  }
  /**
   *
   * @param {string} key
   * @returns
   */
  del(key) {
    delete this.#cache[key];
  }
}
