import { dbkey, VERSION } from "../../app/config.js";
import { bot, members } from "../../app/setup/tg.js";
import { data, SERVISE_stop } from "../../app/start-stop.js";
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

(async () => {
  let session = data.session

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

  bot.telegram.sendMessage(members.xiller, `✅ Кобольдя ${data.versionMSG} запущен за ${(Date.now() - data.start_time) / 1000} сек`);

  if (data.isLatest == 2 || data.isLatest == 'empty array')
    database.set(
      dbkey.version,
      [VERSION[0], VERSION[1], VERSION[2], session],
      true
    );
})();

export async function checkUpdates() {
  let session = data.session

  const dbversion = await database.get(dbkey.version, true);
  data.isLatest = bigger(
    dbversion,
    [VERSION[0], VERSION[1], VERSION[2], session],
    false
  );

  if (data.isLatest == 2 || data.isLatest == 'empty array') return

  SERVISE_stop(`Обнаружена более актуальная запущенная версия ${dbversion.join('.')} (против активной ${data.v})`,
  null,
  true,
  false)
};
