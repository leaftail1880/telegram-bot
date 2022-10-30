import { createClient } from "redis";
import config from "../config.js";
const { VERSION, Plugins, dbkey } = config;
import { database } from "../index.js";
import "./class/cmdCLS.js";
import { emitEvents } from "./class/EventsCLS.js";
import { format } from "./class/formatterCLS.js";
import "./class/queryCLS.js";
import { Xitext } from "./class/XitextCLS.js";
import { bot, env } from "./setup/tg.js";
import { bigger, updateSession, updateVisualVersion } from "./setup/updates.js";

const lang = {
  launchLOG: (reason) => `> ${data.versionLOG} [${reason}]`,
  stopRes: (reason) => `% ${data.versionLOG} stopped. ${reason}`,
  stop: {
    noRespLog: () => lang.stopRes("No response"),
    terminate: () => lang.stopRes(`Terminated`),
    old: () => `${data.versionLOG} stopped. OLD`,
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
      () => console.log(`v${VERSION.join(".")}`),
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
        console.log(`> [Load start] Обнаружен Кобольдя v${VERSION.join(".")}`);
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
      .Url(null, `https://koboldie-bot.onrender.com/stop${data.start_time}`)
      .Bold()
      ._Group()
      .Text(" ")
      .Italic(info ? info : data.versionMSG.split(" ")[1] ?? false)
      ._Build({ disable_web_page_preview: true }),
};

/**======================
 * Кэш сессии
 *========================**/
export const data = {
  v: VERSION.join("."),
  /** @type {boolean | number} */
  isLatest: true,
  versionMSG: `v${VERSION.join(".")} (Инит)`,
  versionLOG: `v${VERSION.join(".")} (Init)`,
  session: 0,
  start_time: Date.now(),
  started: false,
  stopped: false,
  isDev: env.dev ? true : false,
  updateTimer: null,
  debug: false,
  chatIDs: {
    owner: Number(env.ownerID),
    // Айди чата, куда будут поступать самые важные сообщения
    log: Number(env.logID),
  },
};

export const SERVISE = {
  start,
  stop,
  error,
  freeze,
};

export const handlers = {
  processError: handleError,
  dbError: handleDB,
  bot: SERVISE.error,
};

const OnErrorActions = {
  cache: {
    lastTime: Date.now(),
    type: "none",
    cooldown: 1000,
  },
  codes: {
    ECONNRESET: () => {
      if (
        Date.now() - OnErrorActions.cache.lastTime <=
          OnErrorActions.cache.cooldown * 10 &&
        OnErrorActions.cache.type === "ECONNRESET"
      )
        return;
      OnErrorActions.cache.type = "ECONNRESET";
      OnErrorActions.cache.lastTime = Date.now();
      console.log("Нет подключения к интернету");
    },
    ERR_MODULE_NOT_FOUND: (err) => {
      SERVISE.error(err);
    },
    409: () => SERVISE.freeze(),
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
      SERVISE.error(err);
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

export function log(msg, extra = {}) {
  console.log(msg);
  data.debug
    ? bot.telegram.sendMessage(data.chatIDs.owner, msg, extra)
    : bot.telegram.sendMessage(data.chatIDs.log, msg, extra);
}

/**
 * Запуск бота
 * @returns {Promise<void>}
 */
async function start() {
  if (data.isDev) lang.startLOG.dev[0]();
  else lang.startLOG.render[0]();

  /**======================
   * Подключение к базе данных
   *========================**/

  const s = Date.now(),
    client = createClient({
      url: process.env.REDIS_URL,
    });

  client.on("error", handlers.dbError);

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
  bot.catch(handlers.bot);

  bot.telegram.sendMessage(data.chatIDs.log, ...lang.start());

  /**======================
   * Загрузка плагинов
   *========================**/
  let plgs = [];
  if (data.isDev) {
    lang.startLOG.dev[2]();
  }
  for (const plugin of Plugins) {
    const start = Date.now();

    await import(`../modules/${plugin}/index.js`).catch((error) => {
      lang.startLOG.dev[3](plugin, error);
    });
    data.isDev
      ? lang.startLOG.dev[4](plugin, start)
      : plgs.push(`${plugin} (${Date.now() - start} ms)`);
  }
  // Инициализация команд и списков
  emitEvents("afterpluginload");

  /**======================
   * Запуск бота
   *========================**/
  await bot.launch();
  data.started = true;

  if (data.isDev) lang.startLOG.dev[5]();
  else lang.startLOG.render[1](plgs);
  data.updateTimer = setInterval(checkInterval, 5000);
}

async function checkInterval() {
  if (!database.client) return;
  const query = await database.get(dbkey.request, true);
  if (query?.map) {
    const q = bigger([VERSION[0], VERSION[1], VERSION[2]], query);
    if (q === true) return await database.set(dbkey.request, "terminate_you");
    if (q === false || q === 0) {
      await database.set(dbkey.request, "terminate_me");
      await database.close();
      clearInterval(data.updateTimer);
      SERVISE.stop(lang.stop.old(), null, true, false);
      return;
    }
  }
}

async function stop(
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
      data.chatIDs.log,
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
 * @param {{name?: string, message: string, stack: string, on?: object}} error
 */
function error(error) {
  try {
    console.warn(" ");
    console.warn(error);
    console.warn(" ");

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
        data.chatIDs.log,
        ...text._Build({ disable_web_page_preview: true })
      );
      if (PeR[3]) {
        format.sendSeparatedMessage(PeR[3], (a) =>
          bot.telegram.sendMessage(data.chatIDs.log, a, {
            disable_web_page_preview: true,
          })
        );
      }
    }
  } catch (e) {
    console.warn(e);
  }
}

async function freeze() {
  clearInterval(data.updateTimer);
  if (data.started)
    await bot.telegram.sendMessage(data.chatIDs.log, lang.stop.freeze()),
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
      await database.close();
      clearInterval(timeout);
      return SERVISE.stop(lang.stop.terminate(), null, true, data.isDev, false);
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
      bot.telegram.sendMessage(data.chatIDs.log, ...lang.start("Newest"));

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
        data.chatIDs.log,
        ...lang.start("[Не дождаласьи запустилась]", "↩️")
      );
      console.log(lang.launchLOG("No response"));

      data.updateTimer = setInterval(checkInterval, 5000);
      database.del(dbkey.request);
      return;
    }
  }, 5000);
}

async function handleError(err) {
  if (OnErrorActions.codes[err?.response?.error_code]) {
    OnErrorActions.codes[err?.response?.error_code](err);
  } //if (OnErrorActions.messages.includes(err?.name)) {
  else SERVISE.error(err);
  // } else SERVISE.stop(err, null, true);
}

/**
 *
 * @param {Error & {code: string}} err
 * @returns
 */
async function handleDB(err) {
  if (err.message == "Client IP address is not in the allowlist.") {
    lang.runLOG.error.renderRegister();
    await SERVISE.stop("db ip update", null, true, true, false);
    return;
  }
  if (err.code == "ENOTFOUND") {
    return OnErrorActions.codes.ECONNRESET();
  }
  if (err.message == "Socket closed unexpectedly") {
    await database.client.connect();
    return;
  }
  SERVISE.error({
    name: "◔ " + err.name,
    message: err.message,
    stack: err.stack,
  });
}
