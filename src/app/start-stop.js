import { dbkey, Plugins, PORT, VERSION } from "../config.js";
import { app, bot, env, members } from "./setup/tg.js";
import { createClient } from "redis";
import { database } from "../index.js";
import { format } from "./class/formatterCLS.js";
import { bigger, updateSession, updateVisualVersion } from "./setup/updates.js";
import { Xitext } from "./class/XitextCLS.js";
import { loadCMDS } from "./class/cmdCLS.js";
import { loadQuerys } from "./class/queryCLS.js";

/**
 * @typedef {Object} sessionCache
 * @property {String} v 6.3.3
 * @property {Boolean} isLatest true | false | 0 | 'empty array'
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
  updateTimer: null,
};
/**
 * Запуск бота
 * @returns {void}
 */
export async function SERVISE_start() {
  app.get("/healt", (_req, res) => res.sendStatus(200));
  if (data.isDev) {
    console.log(" ");
    console.log(
      `> [Load start] Обнаружен Кобольдя v${VERSION.join(".")}, Порт: ${
        !env.local ? PORT : `localhost:${PORT}`
      }`
    );
    console.log(" ");
  } else console.log(`> v${VERSION.join(".")}, Port: ${PORT}`);

  /**======================
   * Подключение к базе данных
   *========================**/

  const s = Date.now(),
    client = createClient({
      url: process.env.REDIS_URL,
    });

  client.on("error", async (err) => {
    if (err.message == "Client IP address is not in the allowlist.") {
      console.warn(
        "◔ Перерегайся: https://dashboard.render.com/r/red-cc4qn1un6mprie1hdlrg"
      );
      await SERVISE_stop("db ip update", null, true, true, false, false);
      return;
    }
    console.warn("◔ Error: ", err);
  });

  // Сохранение клиента
  await client.connect();
  database.setClient(client, s);
  if (data.isDev) {
    console.log("◔ Подключено");
    console.log(" ");
  }

  // Обновляет сессию
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
    ...new Xitext()
      .Text(`⌬ Кобольдя `)
      ._Group(data.versionMSG.split(" ")[0])
      .Url(null, "https://dashboard.render.com")
      .Bold()
      ._Group()
      .Text(" ")
      .Italic(data.versionMSG.split(" ")[1])
      .Text(" (")
      .Bold((Date.now() - data.start_time) / 1000)
      .Text(" сек)")
      ._Build({ disable_web_page_preview: true })
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
      console.warn(`> Error ${plugin}: ` + error.stack);
    });
    data.isDev
      ? console.log(`> ${plugin} (${Date.now() - start} ms)`)
      : plgs.push(`${plugin} (${Date.now() - start} ms)`);
  }
  // Инициализация команд и списков
  loadCMDS();
  loadQuerys();

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
  data.updateTimer = setInterval(checkInterval, 10000);
}

async function checkInterval() {
  {
    const query = await database.get(dbkey.request, true);
    if (query?.map) {
      const q = bigger([VERSION[0], VERSION[1], VERSION[2]], query, false);
      if (q) return await database.set(dbkey.request, "terminate_you");
      if (!q) {
        await database.set(dbkey.request, "terminate_me");
        await database.client.quit();
        clearInterval(data.updateTimer);
        SERVISE_stop(`${data.versionMSG} terminated by self`, true, false);
      }
    }
  }
}

export async function SERVISE_stop(
  reason,
  extra = null,
  stopBot = true,
  stopApp = true,
  reload = false,
  sendMessage = true
) {
  if (data.started && sendMessage) {
    const text = new Xitext()
      ._Group("> ")
      .Url(null, "https://dashboard.render.com")
      .Bold()
      ._Group()
      .Mono(reason ? `${reason}.` : "Остановка.")
      .Text(
        extra
          ? `\n${
              typeof extra == "object" ? format.stringifyEx(extra, " ") : extra
            } `
          : " ",
        "("
      )
      ._Group(stopApp ? "app" : "")
      .Bold()
      .Underline()
      ._Group()
      .Italic(stopBot ? " bot" : "")
      .Text(")");
    await bot.telegram.sendMessage(
      members.xiller,
      ...text._Build({ disable_web_page_preview: true })
    );
    console.log(text._text);
  }
  if (stopBot && data.started && !data.stopped) {
    data.stopped = true;
    bot.stop(reason);
  }
  stopApp
    ? process.exit(0)
    : reload
    ? ""
    : setTimeout(() => {
        console.log("⌦ End.");
        process.exit(0);
      }, 12000000);
}

export function SERVISE_error(error, extra = null) {
  const text = new Xitext()
    ._Group("✕ ")
    .Bold()
    .Url(null, "https://dashboard.render.com")
    ._Group()
    .Bold(error)
    .Text(
      extra
        ? `\n${
            typeof extra == "object" ? format.stringifyEx(extra, " ") : extra
          } `
        : ""
    );
  if (data.started) {
    bot.telegram.sendMessage(
      members.xiller,
      ...text._Build({ disable_web_page_preview: true })
    );
  }
  console.log(text._text);
}

export async function SERVISE_freeze() {
  clearInterval(data.updateTimer);
  if (data.started)
    await bot.telegram.sendMessage(
      members.xiller,
      `❄️ Бот ${data.versionMSG} заморожен`
    ),
      console.log(`❄️ Бот ${data.versionMSG} заморожен`);
  if (data.started && !data.stopped) {
    data.stopped = true;
    bot.stop("freeze");
  }
  await database.set(
    dbkey.request,
    [VERSION[0], VERSION[1], VERSION[2]],
    true,
    300
  );
  const timeout = setInterval(async () => {
    const answer = await database.get(dbkey.request);
    if (answer === "terminate_you") {
      clearInterval(timeout);
      await database.del(dbkey.request);
      await database.client.quit();
      return SERVISE_stop(
        "🌑 Terminated by new version (Active: " + data.versionMSG + ")",
        null,
        true,
        false,
        false,
        false
      );
    }
    let times = 0;

    if (answer === "terminate_me") {
      data.start_time = Date.now();

      // Обновляет сессию
      await updateSession(data);

      // Обновляет data.v, data.versionMSG, data.isLatest, version и session
      await updateVisualVersion(data);

      /**======================
       * Запуск бота
       *========================**/
      await bot.launch();

      data.stopped = false;
      data.started = true;
      console.log(`${data.versionMSG} вновь запущен`);
      const text = new Xitext()
        .Text(`🌖 Кобольдя `)
        ._Group(data.versionMSG.split(" ")[0])
        .Url(null, "https://dashboard.render.com")
        .Bold()
        ._Group()
        .Text(" ")
        .Italic(data.versionMSG.split(" ")[1])
        .Text(" вновь запущен (")
        .Italic((Date.now() - data.start_time) / 1000)
        .Text(" сек)");
      bot.telegram.sendMessage(
        members.xiller,
        ...text._Build({ disable_web_page_preview: true })
      );
      clearInterval(timeout);
      data.updateTimer = setInterval(checkInterval, 10000);
      database.del(dbkey.request);
      return;
    }
    times++;
    if (times >= 10) {
      data.start_time = Date.now();

      // Обновляет сессию
      await updateSession(data);

      // Обновляет data.v, data.versionMSG, data.isLatest, version и session
      await updateVisualVersion(data);

      /**======================
       * Запуск бота
       *========================**/
      await bot.launch();

      data.stopped = false;
      data.started = true;
      bot.telegram.sendMessage(
        members.xiller,
        ...new Xitext()
          .Text(`↩️ Кобольдя `)
          ._Group(data.versionMSG.split(" ")[0])
          .Url(null, "https://dashboard.render.com")
          .Bold()
          ._Group()
          .Text(" ")
          .Italic(data.versionMSG.split(" ")[1])
          .Text(" разморожен за ")
          .Bold((Date.now() - data.start_time) / 1000)
          .Text(" сек")
          ._Build({ disable_web_page_preview: true })
      );
      console.log(`${data.versionMSG} разморожен`);
      clearInterval(timeout);
      data.updateTimer = setInterval(checkInterval, 10000);
      database.del(dbkey.request);
      return;
    }
  }, 5000);
}
