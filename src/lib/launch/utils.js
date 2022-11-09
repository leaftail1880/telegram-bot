import config from "../../config.js";
import { database } from "../../index.js";
import { triggerEvent } from "../Class/Events.js";

/**
 * @template F, S, E
 * @param {Array<number>} array
 * @param {Array<number>} array2
 * @param {[F, S, E]} arg3
 * @returns {F | S | E}
 */
export function bigger(array, array2, [first, second, equal]) {
  for (let a = 0; a <= Math.max(array.length, array2.length); a++) {
    const [one, two] = [array[a] ?? 0, array2[a] ?? 0];

    if (one > two) return first;
    if (two > one) return second;
  }
  return equal;
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
    dbversion,
    ["realese", "old", "work"]
  );

  // Если версия новая
  if (data.latest === "realese") {
    console.log("> New version!");
    triggerEvent("new.release");
    // Прописываем ее в базе данных
    database.set(
      config.dbkey.version,
      [config.version[0], config.version[1], config.version[2]],
      true
    );
  }

  // Записываем значения
  data.v = `v${config.version.join(".")}.x${`${session}`.padStart(5, "0")}`;

  let d;
  switch (data.latest) {
    case "work":
      d = "Рабочая";
      break;

    case "realese":
      d = "Релиз";
      break;

    case "old":
      d = "Старая";
      break;
  }

  data.publicVersion = `v${data.v} ${d}`;
  data.logVersion = `v${data.v}`;
}
