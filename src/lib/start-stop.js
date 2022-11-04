import { createClient } from "redis";
import config from "../config.js";
import { database } from "../index.js";
import "./Class/Cmd.js";
import { emitEvents } from "./Class/Events.js";
import { format } from "./Class/Formatter.js";
import "./Class/Query.js";
import { Xitext } from "./Class/Xitext.js";
import { bot, env } from "./launch/tg.js";
import {
  bigger,
  updateSession,
  updateVisualVersion,
} from "./launch/updates.js";

/**======================
 * Кэш сессии
 *========================**/
export const data = {
  v: config.version.join("."),
  /** @type {boolean | number} */
  isLatest: true,
  versionMSG: `v${config.version.join(".")} (Инит)`,
  versionLOG: `v${config.version.join(".")} (Init)`,
  session: 0,
  start_time: Date.now(),
  started: false,
  stopped: false,
  isDev: env.dev ? true : false,
  updateTimer: null,
  debug: false,
  benchmark: true,
  bc: performance.now(),
  chatID: {
    // Айди чата, куда будут поступать сообщения
    owner: Number(env.ownerID),
    log: Number(env.logID),
  },
  errorLog: {},
};

import { start_stop_lang as lang } from "./launch/lang.js";
import { handleDB, handleError } from "./utils/handlers.js";

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

export function log(msg, extra = {}) {
  console.log(msg);
  data.debug
    ? bot.telegram.sendMessage(data.chatID.owner, msg, extra)
    : bot.telegram.sendMessage(data.chatID.log, msg, extra);
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

  const s = performance.now();

  const client = createClient({
    url: process.env.REDIS_URL,
  });

  client.on("error", handlers.dbError);

  // Сохранение клиента
  await database.y.connect(client, s);

  if (data.isDev) lang.startLOG.dev[1]();

  // Обновляет сессию
  await updateSession(data);

  // Обновляет data.v, data.versionMSG, data.isLatest, version и session
  await updateVisualVersion(data);

  /**======================
   * Обработчик ошибок
   *========================**/
  bot.catch(handlers.bot);

  bot.telegram.sendMessage(data.chatID.log, ...lang.start());

  /**======================
   * Загрузка плагинов
   *========================**/
  let plgs = [];
  if (data.isDev) {
    lang.startLOG.dev[2]();
  }
  for (const plugin of config.plugins) {
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
  const query = await database.get(config.dbkey.request, true);
  if (query?.map) {
    const q = bigger(
      [config.version[0], config.version[1], config.version[2]],
      query
    );
    if (q === true)
      return await database.set(config.dbkey.request, "terminate_you");
    if (q === false || q === 0) {
      await database.set(config.dbkey.request, "terminate_me");
      await database.y.close();
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
        format.toStr(
          format.isError(extra) ? format.errParse(extra) : extra,
          " "
        )
      ),
      (log = `${log}: ${format.toStr(extra, " ")}`);

  console.log(log);
  if (data.started && sendMessage)
    await bot.telegram.sendMessage(
      data.chatID.log,
      ...text._Build({ disable_web_page_preview: true })
    );

  if ((stopBot || stopApp) && data.started && !data.stopped) {
    data.stopped = true;
    bot.stop(reason);
  }
  if (stopApp || (stopApp === "false" && env.whereImRunning.includes("("))) {
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
        data.chatID.log,
        ...text._Build({ disable_web_page_preview: true })
      );
      if (PeR[3]) {
        format.sendSeparatedMessage(PeR[3], (a) =>
          bot.telegram.sendMessage(data.chatID.log, a, {
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
    await bot.telegram.sendMessage(data.chatID.log, lang.stop.freeze()),
      console.log(lang.stop.freezeLOG());
  if (data.started && !data.stopped) {
    data.stopped = true;
    bot.stop("freeze");
  }
  await database.set(
    config.dbkey.request,
    [config.version[0], config.version[1], config.version[2]],
    true,
    300
  );

  let times = 0;
  const timeout = setInterval(async () => {
    const answer = await database.get(config.dbkey.request);
    if (answer === "terminate_you") {
      await database.del(config.dbkey.request);
      await database.y.close();
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
      bot.telegram.sendMessage(data.chatID.log, ...lang.start("Newest"));

      data.updateTimer = setInterval(checkInterval, 5000);
      database.del(config.dbkey.request);
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
        data.chatID.log,
        ...lang.start("[Не дождаласьи запустилась]", "↩️")
      );
      console.log(lang.launchLOG("No response"));

      data.updateTimer = setInterval(checkInterval, 5000);
      database.del(config.dbkey.request);
      return;
    }
  }, 5000);
}
