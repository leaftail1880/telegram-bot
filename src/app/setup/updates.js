import { dbkey, VERSION } from "../../config.js";
import { database } from "../../index.js";

/**
 *
 * @param {Array<Number>} array
 * @param {Array<Number>} array2
 */
export function bigger(array, array2, returnArray = true) {
  if (!array || !array2) return "empty array";
  for (let a = 0; a <= Math.max(array.length, array2.length); a++) {
    const one = array[a] ?? 0,
      two = array2[a] ?? 0;
    if (one > two) return returnArray ? array : true;
    if (two > one) return returnArray ? array2 : false;
  }
  return returnArray ? array : 0;
}

/**
 * Обновляет session
 * @param {import("../start-stop.js").sessionCache} data
 */
export async function updateSession(data) {
  if (!(await database.has(dbkey.session))) {
    await database.set(dbkey.session, 0);
  }

  await database.add(dbkey.session, 1);

  data.session = await database.get(dbkey.session, true);
}

/**
 * Обновляет data.v, data.versionMSG, data.isLatest и version
 * @param {import("../start-stop.js").sessionCache} data
 */
export async function updateVisualVersion(data) {
  // Получаем данные
  let session = data.session;
  /**
   * @type {Array}
   */
  const dbversion = await database.get(dbkey.version, true);
  if (dbversion.splice) dbversion.splice(3, 10);

  // Сравниваем версии
  data.isLatest = bigger(
    [VERSION[0], VERSION[1], VERSION[2]],
    dbversion,
    false
  );

  // Если версия новая
  if (data.isLatest) {
    if (data.isDev) {
      console.log("⍚ New version! ⍚");
      console.log(" ");
    } else console.log("> New version!");
    // Прописываем ее в базе данных
    database.set(dbkey.version, [VERSION[0], VERSION[1], VERSION[2]], true);
    data.isLatest = true
  }

  // Записываем значения
  data.v = `${VERSION.join(".")}.x${
    "0000".substring(0, 4 - `${session}`.length) + session
  }`;
  let d;
  if (data.isLatest === true) d = "Релиз";
  if (data.isLatest === 0) d = "Рабочая";
  if (data.isLatest === false) d = "Старая";
  data.versionMSG = `v${data.v} ${d}`;
  data.versionLOG = `v${data.v} (${d})`;
  data
}
