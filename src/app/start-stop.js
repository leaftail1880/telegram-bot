import { dbkey, PORT, VERSION } from "./config.js";
import { bot, members } from "./setup/tg.js";
import { createClient } from "redis";
import { database } from "../index.js";
import { format } from "./functions/formatterCLS.js";

/**======================
 * Плагины
 *========================**/
const Plugins = ["commands", "timeChecker", "updates", "html"];

export const data = {
  v: VERSION.join("."),
  isLatest: true,
  versionMSG: `v${VERSION.join(".")}`,
};

async function checkBOT() {
  if (!(await database.has(dbkey.session))) {
    await database.set(dbkey.session, 0);
  }

  await database.add(dbkey.session, 1);

  let session = await database.get(dbkey.session);
  setTimeout(() => {
    setInterval(async () => {
      const cur = await database.get(dbkey.session);
      if (cur > session) SERVISE_stop("new bot: " + cur + "/" + session);
    }, 1000);
  }, 2000)
}

/**
 * Запуск бота
 * @returns {void}
 */
export async function SERVISE_start() {
  console.log(`[Load] Обнаружен Кобольдя v${VERSION.join(".")}, Порт: ${PORT}`);

  /**======================
   * Подключение к базе данных
   *========================**/

  const client = createClient({
    url: process.env.REDIS_URL,
  });

  client.on("error", (err) => console.log("[DB][Error] ", err));

  await client.connect();

  database.client = client;

  await checkBOT();

  /**======================
   * Запуск бота
   *========================**/
  await bot.launch();
  bot.catch((error) => {
    console.log("Ошибка при работе бота: ", error);
    SERVISE_stop("error", error);
  });

  /**======================
   * Загрузка плагинов
   *========================**/
  for (const plugin of Plugins) {
    const start = Date.now();

    await import(`../vendor/${plugin}/index.js`).catch((error) => {
      console.warn(`[Error][Plugin] ${plugin}: ` + error + error.stack);
    });
    console.log(`[Load] ${plugin} (${Date.now() - start} ms)`);
  }
}

export async function SERVISE_stop(reason, extra) {
  await bot.telegram.sendMessage(
    members.xiller,
    `Бот v${data.v} остановлен. Причина: ${reason}${
      extra ? ` (${format.stringifyEx(extra, " ")})` : ""
    }`
  );
  bot.stop(reason);
  process.exit(0);
}
