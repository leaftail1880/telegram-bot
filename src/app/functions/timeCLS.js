class times {
  /**
   * Выводит время в формате 00:00
   * @returns {String}
   */
  shortTime() {
    const time = Number(String(new Date(Date())).split(" ")[4].split(":")[0]),
      min = String(new Date(Date())).split(" ")[4].split(":")[1];
    return `${time}:${min.length == 2 ? min : "0" + min}`;
  }
  /**
   * Выводит время в формате [6, 0]
   * @returns {Array<Number>}
   */
  ArrrayTime() {
    const time = Number(String(new Date(Date())).split(" ")[4].split(":")[0]),
      min = Number(String(new Date(Date())).split(" ")[4].split(":")[1]);
    return [time, min];
  }
}
export const t = new times();
