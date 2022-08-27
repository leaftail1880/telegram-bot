export class db {
  constructor() {
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
}
