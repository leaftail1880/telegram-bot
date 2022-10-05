import { dbkey, Plugins, PORT, VERSION } from "../config.js";
import { app, bot, env, members } from "./setup/tg.js";
import { createClient } from "redis";
import { database } from "../index.js";
import { format } from "./class/formatterCLS.js";
import { bigger, updateSession, updateVisualVersion } from "./setup/updates.js";
import { Xitext } from "./class/XitextCLS.js";
import { loadCMDS } from "./class/cmdCLS.js";
import { loadQuerys } from "./class/queryCLS.js";
import { emitEvents, loadEvents } from "./class/EventsCLS.js";

const lang = {
  launchLOG: (reason) => `> ${data.versionLOG} [${reason}]`,
  stopRes: (reason) => `% ${data.versionLOG} stopped. ${reason}`,
  stop: {
    noRespLog: () => lang.stopRes("No response"),
    terminate: () => lang.stopRes(`Terminated`),
    old: () => `% ${data.versionLOG} stopped. OLD`,
    freeze: () => `$ ${data.versionMSG} freezed.`,
    freezeLOG: () => lang.stopRes(`FRZ!`),
  },
  runLOG: {
    error: {
      renderError: (err) => console.warn("◔ Error: ", err),
      renderRegister: () =>
        console.warn(
          "◔ Перерегайся: dashboard.render.com/r/red-cc4qn1un6mprie1hdlrg"
        ),
    },
  },
  startLOG: {
    render: [
      () => console.log(`v${VERSION.join(".")}, Port: ${PORT}`),
      (plgs) =>
        console.log(
          `${(Date.now() - data.start_time) / 1000} sec, Session: ${
            data.session
          }, plugins: ${plgs.join(", ")}`
        ),
    ],
    dev: [
      () => {
        console.log(" ");
        console.log(
          `> [Load start] Обнаружен Кобольдя v${VERSION.join(".")}, Порт: ${
            !env.local ? PORT : `localhost:${PORT}`
          }`
        );
        console.log(" ");
      },
      () => {
        console.log("◔ Подключено");
        console.log(" ");
      },
      () => {
        console.log("Plugins: ");
        console.log(" ");
      },
      (plugin, error) => {
        console.warn(`> Error ${plugin}: ` + error.stack);
      },
      (plugin, start) => {
        console.log(`> ${plugin} (${Date.now() - start} ms)`);
      },
      () => {
        console.log(" ");
        console.log("Done.");
        console.log(" ");
        console.log(
          `> [Load end] ${
            (Date.now() - data.start_time) / 1000
          } sec, Session: ${data.session}`
        );
        console.log(" ");
      },
    ],
  },
  start: (info, prefix = "⌬") =>
    new Xitext()
      .Text(`${prefix} Кобольдя `)
      ._Group(data.versionMSG.split(" ")[0])
      .Url(null, `https://kobolie_bot.onrender.com/stop${data.start_time}`)
      .Bold()
      ._Group()
      .Text(" ")
      .Italic(info ? info : data.versionMSG.split(" ")[1] ?? false)
      .Text(" (")
      .Bold((Date.now() - data.start_time) / 1000)
      .Text(" сек)")
      ._Build({ disable_web_page_preview: true }),
};

/**
 * @typedef {Object} sessionCache
 * @property {String} v 6.3.3
 * @property {Boolean} isLatest true | false | 0 | 'empty array'
 * @property {String} versionMSG v6.3.3 (Init)
 * @property {String} versionLOG v6.3.3
 * @property {Number} session 0
 * @property {Number} start_time 1224214
 * @property {Boolean} started true
 * @property {Boolean} stopped false
 * @property {Boolean} isDev false
 * @property {Boolean} debug
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
  debug: false,
  logChatId: {
    // Айди чата, куда будут поступать самые важные сообщения
    owner: members.xiller,
    log: env.logGroupId,
  },
};

const OnErrorActions = {
  cache: {
    lastTime: Date.now(),
    type: "none",
    cooldown: 1000,
  },
  codes: {
    "ERR_MODULE_NOT_FOUND": (err) => {
      SERVISE_error(err)
    },
    409: () => SERVISE_freeze(),
    400: (err) => {
      if (err?.response?.description?.includes("not enough rights")) {
        bot.telegram.sendMessage(
          err.on.payload.chat_id,
          'У бота нет разрешений для выполнения действия "' +
            err.on.method +
            '"'
        );
        return;
      }
      SERVISE_error(err);
    },
    429: (err) => {
      if (
        Date.now() - OnErrorActions.cache.lastTime <=
          OnErrorActions.cache.cooldown &&
        OnErrorActions.cache.type === err.stack
      )
        return;
      OnErrorActions.cache.type = err.stack;
      OnErrorActions.cache.lastTime = Date.now();
      console.warn(err.stack);
    },
    413: (err) => {
      console.warn(err);
    },
  },
  messages: [
    "TypeError",
    "SyntaxError",
    "Socket closed unexpectedly",
    "ReferenceError",
  ],
};

export async function handleError(err) {
  if (OnErrorActions.codes[err?.response?.error_code]) {
    OnErrorActions.codes[err?.response?.error_code](err);
  } else if (OnErrorActions.messages.includes(err?.stack?.split(":")[0])) {
    SERVISE_error(err);
  } else SERVISE_stop(err, null, true);
}

export function log(msg, extra = {}) {
  console.log(msg);
  data.debug
    ? bot.telegram.sendMessage(data.logChatId.owner, msg, extra)
    : bot.telegram.sendMessage(data.logChatId.log, msg, extra);
}

/**
 * Запуск бота
 * @returns {void}
 */
export async function SERVISE_start() {
  app.get(`/stop${data.start_time}`, (_req, res) => {res.sendStatus(453); 
    SERVISE_stop('SiteRequest', null, true, true)
  })
  if (data.isDev) lang.startLOG.dev[0]();
  else lang.startLOG.render[0]();

  /**======================
   * Подключение к базе данных
   *========================**/

  const s = Date.now(),
    client = createClient({
      url: process.env.REDIS_URL,
    });

  client.on("error", async (err) => {
    if (err.message == "Client IP address is not in the allowlist.") {
      lang.runLOG.error.renderRegister();
      await SERVISE_stop("db ip update", null, true, true, false, false);
      return;
    }
    if (err.message == "Socket closed unexpectedly") {
      await client.connect();
      return;
    }
    lang.runLOG.error.renderError(err);
  });

  // Сохранение клиента
  await client.connect();
  database.setClient(client, s);
  if (data.isDev) lang.startLOG.dev[1]();

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
  bot.telegram.sendMessage(data.logChatId.log, ...lang.start());

  /**======================
   * Загрузка плагинов
   *========================**/
  let plgs = [];
  if (data.isDev) {
    lang.startLOG.dev[2]();
  }
  for (const plugin of Plugins) {
    const start = Date.now();

    await import(`../vendor/${plugin}/index.js`).catch((error) => {
      lang.startLOG.dev[3](plugin, error);
    });
    data.isDev
      ? lang.startLOG.dev[4](plugin, start)
      : plgs.push(`${plugin} (${Date.now() - start} ms)`);
  }
  // Инициализация команд и списков
  loadCMDS();
  loadQuerys();
  loadEvents();
  emitEvents("afterpluginload");

  if (data.isDev) lang.startLOG.dev[5]();
  else lang.startLOG.render[1](plgs);
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
      SERVISE_stop(lang.stop.old(), null, true, false);
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
  let log = `✕  `;
  const text = new Xitext()
    ._Group("✕  ")
    .Url(null, "https://dashboard.render.com")
    .Bold()
    ._Group();

  if (stopApp) text.Bold("ALL. "), (log = `${log}ALL. `);
  else if (stopBot) text.Text("BOT. "), (log = `${log}BOT. `);

  text.Mono(reason + "");
  log = `${log}${reason}`;

  if (extra)
    text
      .Text(": ")
      .Text(
        format.stringifyEx(
          format.isError(extra) ? format.errParse(extra) : extra,
          " "
        )
      ),
      (log = `${log}: ${format.stringifyEx(extra, " ")}`);

  console.log(log);
  if (data.started && sendMessage)
    await bot.telegram.sendMessage(
      data.logChatId.log,
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
  console.warn(
    `${error?.message}: ${error?.stack.replace(error.message, "") ?? error}`
  );
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
      data.logChatId.log,
      ...text._Build({ disable_web_page_preview: true })
    );
    if (PeR[3]) {
      format.sendSeparatedMessage(PeR[3], (a) =>
        bot.telegram.sendMessage(data.logChatId.log, a, {
          disable_web_page_preview: true,
        })
      );
    }
  }
}

export async function SERVISE_freeze() {
  clearInterval(data.updateTimer);
  if (data.started)
    await bot.telegram.sendMessage(data.logChatId.log, lang.stop.freeze()),
      console.log(lang.stop.freezeLOG());
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
      return SERVISE_stop(lang.stop.terminate(), null, true, data.isDev, false);
    }

    if (answer === "terminate_me") {
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
      console.log(lang.launchLOG("[Запущена как новый]"));
      bot.telegram.sendMessage(data.logChatId.log, ...lang.start("Newest"));

      data.updateTimer = setInterval(checkInterval, 5000);
      database.del(dbkey.request);
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
        data.logChatId.log,
        ...lang.start("[Не дождаласьи запустилась]", "↩️")
      );
      console.log(lang.launchLOG("No response"));

      data.updateTimer = setInterval(checkInterval, 5000);
      database.del(dbkey.request);
      return;
    }
  }, 5000);
}
