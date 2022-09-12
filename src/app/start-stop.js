import { dbkey, Plugins, PORT, VERSION } from "../config.js";
import { app, bot, env, members } from "./setup/tg.js";
import { createClient } from "redis";
import { database } from "../index.js";
import { format } from "./class/formatterCLS.js";
import { bigger, updateSession, updateVisualVersion } from "./setup/updates.js";
import { Xitext } from "./class/XitextCLS.js";
import { loadCMDS } from "./class/cmdCLS.js";
import { loadQuerys } from "./class/queryCLS.js";
import { loadEvents } from "./class/EventsCLS.js";

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
  versionMSG: `v${VERSION.join(".")} (Инит)`,
  versionLOG: `v${VERSION.join(".")} (Init)`,
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
  } else console.log(`v${VERSION.join(".")}, Port: ${PORT}`);

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
  bot.catch(SERVISE_error);

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
      .Italic(data.versionMSG.split(" ")[1] ?? false)
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
  loadEvents();

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
      `${(Date.now() - data.start_time) / 1000} sec, Session: ${
        data.session
      }, plugins: ${plgs.join(", ")}`
    );
  if (data.isDev) console.log(" ");
  data.updateTimer = setInterval(checkInterval, 5000);
}

async function checkInterval() {
  if (!database.client) return;
  const query = await database.get(dbkey.request, true);
  if (query?.map) {
    const q = bigger([VERSION[0], VERSION[1], VERSION[2]], query, false);
    if (q === true) return await database.set(dbkey.request, "terminate_you");
    if (q === false || q === 0) {
      await database.set(dbkey.request, "terminate_me");
      await database.client.quit();
      database.client = false;
      clearInterval(data.updateTimer);
      SERVISE_stop(
        `${data.versionLOG} выключился как старый`,
        null,
        true,
        false
      );
      return;
    }
  }
}

export async function SERVISE_stop(
  reason = "Остановка",
  extra = null,
  stopBot,
  stopApp,
  sendMessage = true
) {
  let log = `✕ `;
  const text = new Xitext()
    ._Group("✕ ")
    .Url(null, "https://dashboard.render.com")
    .Bold()
    ._Group();

  if (stopApp) text.Bold("ALL \n");
  if (stopBot && !stopApp) text.Text("bot: \n"), (log = `${log}bot: \n`);

  text.Mono(reason + "").Text(": ");
  log = `${log} ${reason}: `;

  if (extra)
    text.Text(format.stringifyEx(extra, " ")),
      (log = log + format.stringifyEx(extra, " "));

  console.log(log);
  if (data.started && sendMessage)
    await bot.telegram.sendMessage(
      members.xiller,
      ...text._Build({ disable_web_page_preview: true })
    );

  if ((stopBot || stopApp) && data.started && !data.stopped) {
    data.stopped = true;
    bot.stop(reason);
  }
  if (stopApp) {
    process.exit(0);
  }
}

/**
 *
 * @param {Error} error
 */
export function SERVISE_error(error) {
  const PeR = format.errParse(error, true),
    text = new Xitext()
      ._Group(PeR[0])
      .Bold()
      .Url(null, "https://dashboard.render.com")
      ._Group()
      ._Group(PeR[1])
      .Bold()
      .Mono()
      ._Group()
      .Text(` ${PeR[2]}`);
  if (data.started) {
    bot.telegram.sendMessage(
      members.xiller,
      ...text._Build({ disable_web_page_preview: true })
    );
  }
  console.log(text._text);
  if (PeR[3]) {
    console.log(PeR[3]);
    format.sendSeparatedMessage(PeR[3], (a) =>
      bot.telegram.sendMessage(members.xiller, a)
    );
  }
}

export async function SERVISE_freeze() {
  clearInterval(data.updateTimer);
  if (data.started)
    await bot.telegram.sendMessage(
      members.xiller,
      `❄️ Бот ${data.versionMSG} ждет ответа от сессии`
    ),
      console.log(`FRZ! ${data.versionLOG}`);
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

  let times = 0;
  const timeout = setInterval(async () => {
    const answer = await database.get(dbkey.request);
    if (answer === "terminate_you") {
      await database.del(dbkey.request);
      await database.client.quit();
      database.client = false;
      clearInterval(timeout);
      return SERVISE_stop(
        "🌑 Terminated by new version (Active: " + data.versionMSG + ")",
        null,
        true,
        false,
        false
      );
    }

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
      console.log(`${data.versionLOG} запущен как последний`);
      const text = new Xitext()
        .Text(`🌖 Кобольдя `)
        ._Group(data.versionMSG.split(" ")[0])
        .Url(null, "https://dashboard.render.com")
        .Bold()
        ._Group()
        .Text(" ")
        .Italic(data.versionMSG.split(" ")[1])
        .Text(" запущен как последний (")
        .Italic((Date.now() - data.start_time) / 1000)
        .Text(" сек)");
      bot.telegram.sendMessage(
        members.xiller,
        ...text._Build({ disable_web_page_preview: true })
      );

      data.updateTimer = setInterval(checkInterval, 10000);
      database.del(dbkey.request);
      clearInterval(timeout);
      return;
    }

    times++;
    if (times >= 10) {
      clearInterval(timeout);
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
          .Text(" не получил ответа и вернулся за ")
          .Bold((Date.now() - data.start_time) / 1000)
          .Text(" сек")
          ._Build({ disable_web_page_preview: true })
      );
      console.log(`${data.versionLOG} не дождался ответа сервера`);

      data.updateTimer = setInterval(checkInterval, 5000);
      database.del(dbkey.request);
      return;
    }
  }, 5000);
}
