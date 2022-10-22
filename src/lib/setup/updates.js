import config from "../../config.js";
import { database } from "../../index.js";

/**
 *
 * @param {Array<number>} array
 * @param {Array<number>} array2
 * @returns
 */
export function bigger(array, array2) {
  for (let a = 0; a <= Math.max(array.length, array2.length); a++) {
    const one = array[a] ?? 0,
      two = array2[a] ?? 0;
    if (one > two) return true;
    if (two > one) return false;
  }
  return 0;
}

/**
 * Обновляет session
 * @param {SessionData} data
 */
export async function updateSession(data) {
  if (!(await database.has(config.dbkey.session))) {
    await database.set(config.dbkey.session, 0);
  }

  await database.add(config.dbkey.session, 1);

  data.session = await database.get(config.dbkey.session, true);
}

/**
 * Обновляет data.v, data.versionMSG, data.isLatest и version
 * @param {SessionData} data
 */
export async function updateVisualVersion(data) {
  // Получаем данные
  let session = data.session;
  /**
   * @type {Array}
   */
  const dbversion = await database.get(config.dbkey.version, true);
  if (dbversion.splice) dbversion.splice(3, 10);

  // Сравниваем версии
  data.isLatest = bigger([config.VERSION[0], config.VERSION[1], config.VERSION[2]], dbversion);

  // Если версия новая
  if (data.isLatest) {
    if (data.isDev) {
      console.log("⍚ New version! ⍚");
      console.log(" ");
    } else console.log("> New version!");
    // Прописываем ее в базе данных
    database.set(config.dbkey.version, [config.VERSION[0], config.VERSION[1], config.VERSION[2]], true);
    data.isLatest = true;
  }

  // Записываем значения
  data.v = `${config.VERSION.join(".")}.x${
    "0000".substring(0, 4 - `${session}`.length) + session
  }`;
  let d;
  if (data.isLatest === 0) d = "Рабочая";
  if (data.isLatest === true) d = "Релиз";
  if (data.isLatest === false) d = "Старая";
  data.versionMSG = `v${data.v} ${d}`;
  data.versionLOG = `v${data.v}`;
}
