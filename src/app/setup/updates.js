import { dbkey, VERSION } from "../../config.js";
import { database } from "../../index.js";

/**
 *
 * @param {Array<Number>} array
 * @param {Array<Number>} array2
 */
function bigger(array, array2, returnArray = true) {
  if (!array || !array2) return "empty array";
  for (let a = 0; a <= Math.max(array.length, array2.length); a++) {
    const one = array[a] ?? 0,
      two = array2[a] ?? 0;
    if (one > two) return returnArray ? array : true;
    if (two > one) return returnArray ? array2 : false;
  }
  return returnArray ? array : 0;
}

export async function updateSession(data) {
  if (!(await database.has(dbkey.session))) {
    await database.set(dbkey.session, 0);
  }

  await database.add(dbkey.session, 1);

  data.session = await database.get(dbkey.session, true);
}

/**
 * Обновляет data.v, data.versionMSG, data.isLatest, version и session
 * @param {Object} data
 */
export async function updateVisualVersion(data) {
  // Получаем данные
  let session = data.session;
  const dbversion = await database.get(dbkey.version, true);

  // Сравниваем версии
  data.isLatest = bigger(
    [VERSION[0], VERSION[1], VERSION[2], session],
    dbversion,
    false
  );

  // Если версия новая
  if (data.isLatest) {
    console.log("⍚ New version! ⍚");
    console.log(" ");
    // Прописываем ее в базе данных
    database.set(
      dbkey.version,
      [VERSION[0], VERSION[1], VERSION[2], Number(session)],
      true
    );
    data.isLatest = true;

    // Обнуляем сессию
    data.session = 0;
    database.set(dbkey.session, 0);
  }

  // Записываем значения
  data.v = `${VERSION.join(".")}.${session}`;
  data.versionMSG = `v${data.v}${
    data.isLatest ? ` (Последняя)` : " (Стабильная)"
  }`;
}
