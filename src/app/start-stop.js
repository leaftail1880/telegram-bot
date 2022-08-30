import { PORT, VERSION } from "./config.js";
import { app, bot, members } from "./setup/tg.js";
import { createClient } from "redis";
import { database } from "../index.js";
import { format } from "./functions/formatterCLS.js";
import {
  checkUpdates,
  updateSession,
  updateVisualVersion,
} from "./setup/updates.js";

/**======================
 * Плагины
 *========================**/
const Plugins = ["Command", "timeChecker", "html"];

/**======================
 * Кэш сессии
 *========================**/
export const data = {
  v: VERSION.join("."),
  isLatest: true,
  versionMSG: `v${VERSION.join(".")} (Init)`,
  session: 0,
  start_time: Date.now(),
  started: false,
  stopped: false,
};

/**
 * Запуск бота
 * @returns {void}
 */
export async function SERVISE_start() {
  console.log(" ");
  console.log(
    `> [Start] Обнаружен Кобольдя v${VERSION.join(".")}, Порт: ${PORT}`
  );
  console.log(" ");
  // let anim = true,
  //   c = 0;
  // setInterval(async () => {
  //   if (anim) console.log(`> ${c}/5`), c++;
  // }, 1000);
  /**======================
   * Подключение к базе данных
   *========================**/

  const client = createClient({
    url: process.env.REDIS_URL,
  });

  client.on("error", (err) => console.log("[DB][Error] ", err));

  await client.connect();

  database.setClient(client);

  await updateSession(data);

  await updateVisualVersion(data);

  /**======================
   * Обработчик ошибок
   *========================**/
  bot.catch((error) => {
    console.log("Ошибка при работе бота: ", error);
    SERVISE_stop("error", error);
  });

  /**======================
   * Остановка при обнаружении новой версии
   *========================**/
  // setInterval(async () => {
  //   checkUpdates(data);
  // }, 1000);

  //setTimeout(async () => {
  //anim = false;
  /**======================
   * Запуск бота
   *========================**/
  await bot.launch();
  data.started = true;
  bot.telegram.sendMessage(
    members.xiller,
    `✅ Кобольдя ${data.versionMSG} запущен за ${
      (Date.now() - data.start_time) / 1000
    } сек`
  );

  /**======================
   * Загрузка плагинов
   *========================**/

  console.log("Plugins: ");
  console.log(" ");
  for (const plugin of Plugins) {
    const start = Date.now();

    await import(`../vendor/${plugin}/index.js`).catch((error) => {
      console.warn(`> Error ${plugin}: ` + error + error.stack);
    });
    console.log(`> ${plugin} (${Date.now() - start} ms)`);
  }
  console.log(" ");
  console.log("Done.");
  console.log(" ");
  console.log(
    `> [End] ${(Date.now() - data.start_time) / 1000} sec, Session: ${
      data.session
    }`
  );
  console.log(" ");
  app.get("/healt", (_req, res) => res.sendStatus(200));
  //}, 5000);
}

export async function SERVISE_stop(
  reason,
  extra = null,
  stopBot = true,
  stopApp = true
) {
  if (data.started)
    await bot.telegram.sendMessage(
      members.xiller,
      `⚠️ Бот остановлен${reason ? ` по причине: ${reason}.` : "."}${
        extra ? ` (${format.stringifyEx(extra, " ")})` : ""
      }\n🌐 Остановка сервера: ${
        stopApp ? "❌ Да" : "✅ Нет"
      }\n🤖 Остановка бота: ${stopBot ? "❌ Да" : "✅ Нет"}`
    ),
      console.log(
        `> [Stop] Бот остановлен${reason ? ` по причине: ${reason}.` : "."}${
          extra ? ` (${format.stringifyEx(extra, " ")})` : ""
        }\nApp: ${stopApp}\nBot: ${stopBot}`
      );
  if (stopBot && data.started && !data.stopped)
    (data.stopped = true), bot.stop(reason);
  stopApp
    ? process.exit(0)
    : setTimeout(() => {
        console.log("[Stop] Конец сессии.");
        process.exit(0);
      }, 12000000);
}
