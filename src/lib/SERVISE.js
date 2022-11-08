import { createClient } from "redis";
import config from "../config.js";
import { database } from "../index.js";
import "./Class/Cmd.js";
import { emitEvents } from "./Class/Events.js";
import { util } from "./Class/Utils.js";
import "./Class/Query.js";
import { Xitext } from "./Class/Xitext.js";
import { bot, env } from "./launch/tg.js";
import {
  bigger,
  updateSession,
  updateVisualVersion,
} from "./launch/updates.js";

export const data = {
  v: config.version.join("."),

  /** @type {boolean | number} */
  latest: true,
  publicVersion: `v${config.version.join(".")}`,
  logVersion: `v${config.version.join(".")} I`,
  start_time: Date.now(),
  session: 0,

  started: false,
  stopped: false,

  isDev: env.dev ? true : false,
  debug: false,
  benchmark: true,

  chatID: {
    // Айди чата, куда будут поступать сообщения
    owner: Number(env.ownerID),
    log: Number(env.logID),
  },

  errorLog: {},
  updateTimer: null,
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
  lang.log.start();

  /**======================
   * Подключение к базе данных
   *========================**/
  const time = performance.now();

  const client = createClient({
    url: process.env.REDIS_URL,
  });

  client.on("error", handlers.dbError);

  // Сохранение клиента
  await database.y.connect(client, time);

  // Обновляет сессию
  await updateSession(data);

  await updateVisualVersion(data);

  bot.catch(handlers.bot);

  bot.telegram.sendMessage(data.chatID.log, ...lang.start());

  /**======================
   * Загрузка плагинов
   *========================**/
  const m = [];
  for (const module of config.modules) {
    const start = performance.now();

    await import(`../modules/${module}/index.js`).catch(SERVISE.error);

    m.push(`${module} (${(performance.now() - start).toFixed(2)} ms)`);
  }
  // Инициализация команд и списков
  emitEvents("modules.load");

  /**======================
   * Запуск бота
   *========================**/
  await bot.launch();
  data.started = true;

  lang.log.end(m);
  data.updateTimer = setInterval(checkInterval, 5000);
}

async function checkInterval() {
  if (!database.client) return;
  const query = await database.get(config.dbkey.request, true);
  if (!query?.map) return;
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
    SERVISE.stop(lang.stop.old(), null, true, data.isDev);
    return;
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
  const text = new Xitext()._.group("✕  ")
    .url(null, "https://t.me")
    .bold()
    ._.group();

  if (stopApp) text.bold("ALL. "), (log = `${log}ALL. `);
  else if (stopBot) text.text("BOT. "), (log = `${log}BOT. `);

  text.text(reason + "");
  log = `${log}${reason}`;

  if (extra)
    text
      .text(": ")
      .text(
        util.toStr(util.isError(extra) ? util.errParse(extra) : extra, " ")
      ),
      (log = `${log}: ${util.toStr(extra, " ")}`);

  console.log(log);
  if (data.started && sendMessage)
    await bot.telegram.sendMessage(
      data.chatID.log,
      ...text._.build({
        disable_web_page_preview: true,
      })
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
async function error(error) {
  try {
    console.warn(" ");
    console.warn(error);
    console.warn(" ");

    const [type, message, stack, extra] = util.errParse(error, true);

    const text = new Xitext()
      .url(type, "https://t.me")
      ._.group(message)
      .bold()
      ._.group()
      .text(` ${stack}`);

    if (!data.started) return;

    await bot.telegram.sendMessage(
      data.chatID.log,
      ...text._.build({
        disable_web_page_preview: true,
      })
    );

    if (extra) {
      await util.sendSeparatedMessage(
        extra,
        async (a) =>
          await bot.telegram.sendMessage(data.chatID.log, a, {
            disable_web_page_preview: true,
          })
      );
    }
  } catch (e) {
    console.warn(e);
  }
}

async function freeze() {
  clearInterval(data.updateTimer);
  if (data.started)
    await bot.telegram.sendMessage(data.chatID.log, ...lang.stop.freeze()),
      console.log(lang.stop.freeze()[0]);

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
      await database.delete(config.dbkey.request);
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
      console.log(lang.logLaunch("as newest"));
      bot.telegram.sendMessage(
        data.chatID.log,
        ...lang.start("Запущена как новая")
      );

      data.updateTimer = setInterval(checkInterval, 5000);
      database.delete(config.dbkey.request);
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
        ...lang.start("Нет ответа", "↩️")
      );
      console.log(lang.logLaunch("no response"));

      data.updateTimer = setInterval(checkInterval, 5000);
      database.delete(config.dbkey.request);
      return;
    }
  }, 5000);
}
