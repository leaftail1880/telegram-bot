import config from "../../config.js";
import { database } from "../../index.js";
import { emitEvents } from "../Class/Events.js";

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

  await database.increase(config.dbkey.session, 1);

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
   * @type {number[]}
   */
  const dbversion = await database.get(config.dbkey.version, true);
  if (dbversion.splice) dbversion.splice(3, 10);

  // Сравниваем версии
  data.latest = bigger(
    [config.version[0], config.version[1], config.version[2]],
    dbversion
  );

  // Если версия новая
  if (data.latest) {
    console.log("> New version!");
    emitEvents("release");
    // Прописываем ее в базе данных
    database.set(
      config.dbkey.version,
      [config.version[0], config.version[1], config.version[2]],
      true
    );
    data.latest = true;
  }

  // Записываем значения
  data.v = `${data.v}.x${`${session}`.padStart(5, "0")}`;

  let d;
  switch (data.latest) {
    case 0:
      d = "Рабочая";
      break;

    case true:
      d = "Релиз";
      break;

    case false:
      d = "Старая";
      break;
  }

  data.publicVersion = `v${data.v} ${d}`;
  data.logVersion = `v${data.v}`;
}
