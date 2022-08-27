export class db {
  constructor() {
    /**
     * @type {import("redis").RedisClientType}
     */
    this.client = null;
  }
  /**
   * Запрашивает данные с датабазы
   * @param {String} key 
   * @returns {String | Boolean | Object}
   */
  async get(key) {
    if (!this.client) throw new Error("Нет дб");
    const value = await this.client.get(key);
    return value;
  }
  /**
   * Устанавливает данные в базу данных
   * @param {String} key 
   * @param {String | Boolean | Object} value 
   * @returns 
   */
  async set(key, value) {
    if (!this.client) throw new Error("Нет дб");
    await this.client.set(key, value);
    return value;
  }
  async has(key) {
    if (!this.client) throw new Error("Нет дб");
    const boolean = await this.client.exists(key);
    return boolean;
  }
  async add(key, number = 1) {
    if (!this.client) throw new Error("Нет дб");
    const result = await this.client.incrBy(key, number);
    return result;
  }
  async remove(key, number = 1) {
    if (!this.client) throw new Error("Нет дб");
    const result = await this.client.decrBy(key, number);
    return result;
  }
}