import { Plugins, PORT, VERSION } from "../config.js";
import { app, bot, env, members } from "./setup/tg.js";
import { createClient } from "redis";
import { database } from "../index.js";
import { format } from "./functions/formatterCLS.js";
import { updateSession, updateVisualVersion } from "./setup/updates.js";

/**
 * @typedef {Object} sessionCache
 * @property {String} v 6.3.3
 * @property {Boolean} isLatest true | false | 'empty array'
 * @property {String} versionMSG v6.3.3 (Init)
 * @property {Number} session 0
 * @property {Number} start_time 1224214
 * @property {Boolean} started true
 * @property {Boolean} stopped false
 * @property {Boolean} isDev false
 */
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
  isDev: env.xillerPC ? true : false,
};
/**
 * Запуск бота
 * @returns {void}
 */
export async function SERVISE_start() {
  if (data.isDev) {
    console.log(" ");
    console.log(
      `> [Load start] Обнаружен Кобольдя v${VERSION.join(".")}, Порт: ${PORT}`
    );
    console.log(" ");
  } else console.log(`> v${VERSION.join(".")}, Port: ${PORT}`);

  /**======================
   * Подключение к базе данных
   *========================**/

  const client = createClient({
    url: process.env.REDIS_URL,
  });

  client.on("error", (err) => console.log("[DB Error] ", err));

  // Сохранение клиента
  await client.connect();
  database.setClient(client);

  await updateSession(data);

  // Обновляет data.v, data.versionMSG, data.isLatest, version и session
  await updateVisualVersion(data);

  /**======================
   * Обработчик ошибок
   *========================**/
  bot.catch((error) => {
    console.log("Ошибка при работе бота: ", error);
    SERVISE_stop("error", error);
  });

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
  let plgs = [];
  if (data.isDev) {
    console.log("Plugins: ");
    console.log(" ");
  }
  for (const plugin of Plugins) {
    const start = Date.now();

    await import(`../vendor/${plugin}/index.js`).catch((error) => {
      console.warn(`> Error ${plugin}: ` + error + error.stack);
    });
    data.isDev
      ? console.log(`> ${plugin} (${Date.now() - start} ms)`)
      : plgs.push(`${plugin} (${Date.now() - start} ms)`);
  }
  if (data.isDev) {
    console.log(" ");
    console.log("Done.");
    console.log(" ");
    console.log(
      `> [Load end] ${(Date.now() - data.start_time) / 1000} sec, Session: ${
        data.session
      }`
    );
  } else
    console.log(
      `> ${(Date.now() - data.start_time) / 1000} sec, Session: ${
        data.session
      }, plugins: ${plgs.join(", ")}`
    );
  if (data.isDev) console.log(" ");
  app.get("/healt", (_req, res) => res.sendStatus(200));
}

export async function SERVISE_stop(
  reason,
  extra = null,
  stopBot = true,
  stopApp = true,
  reload = false
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
        `[Stop] ${reason ? `${reason}.` : ""}${
          extra ? ` (${format.stringifyEx(extra, " ")})` : ""
        } APPsop: ${stopApp} BOTstop: ${stopBot}`
      );
  if (stopBot && data.started && !data.stopped) {
    data.stopped = true;
    bot.stop(reason);
  }
  stopApp
    ? process.exit(0)
    : reload
    ? ""
    : setTimeout(() => {
        console.log("[Stop] End.");
        process.exit(0);
      }, 12000000);
}
