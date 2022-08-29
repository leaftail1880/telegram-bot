import { dbkey, VERSION } from "../../app/config.js";
import { bot, members } from "../../app/setup/tg.js";
import { SERVISE_stop, data } from "../../app/start-stop.js";
import { database } from "../../index.js";

/**
 *
 * @param {Array<Number>} array
 * @param {Array<Number>} array2
 */
function bigger(array, array2, returnArray = true) {
  if (!array || !array2) return 'empty array'
  for (let a = 0; a <= Math.max(array.length, array2.length); a++) {
    const one = array[a] ?? 0,
      two = array2[a] ?? 0;
    if (one > two) return returnArray ? array : 1;
    if (two > one) return returnArray ? array2 : 2;
  }
  return returnArray ? array : 0;
}

export async function update() {
  let session = await database.get(dbkey.session);

  data.v = `${VERSION.join(".")}.${session}`;
  const dbversion = await database.get(dbkey.version, true);
  data.isLatest = bigger(
    dbversion,
    [VERSION[0], VERSION[1], VERSION[2], session],
    false
  );
  data.versionMSG = `v${data.v}${
    data.isLatest == 1 ? ` (Стабильная)` : " (Последняя)"
  }`;

  bot.telegram.sendMessage(members.xiller, data.versionMSG);

  if (data.isLatest == 2 || data.isLatest == 'empty array')
    database.set(
      dbkey.version,
      [VERSION[0], VERSION[1], VERSION[2], session],
      true
    );
  return session
};
