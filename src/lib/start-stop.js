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
  me: bot.botInfo,
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
  for (const plugin of config.modules) {
    const start = Date.now();

    await import(`../modules/${plugin}/index.js`).catch((error) => {
      lang.startLOG.dev[3](plugin, error);
    });
    data.isDev
      ? lang.startLOG.dev[4](plugin, start)
      : plgs.push(`${plugin} (${Date.now() - start} ms)`);
  }
  // Инициализация команд и списков
  emitEvents("modules.load");

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
      SERVISE.stop(lang.stop.old(), null, true, data.isDev);
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
      ...text._.build({ disable_web_page_preview: true })
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

    const PeR = util.errParse(error, true),
      text = new Xitext()._.group(PeR[0])
        .bold()
        .url(null, "https://t.me")
        ._.group()
        ._.group(PeR[1])
        .bold()
        .mono()
        ._.group()
        .text(` ${PeR[2]}`);
    if (data.started) {
      await bot.telegram.sendMessage(
        data.chatID.log,
        ...text._.build({ disable_web_page_preview: true })
      );
      if (PeR[3]) {
        util.sendSeparatedMessage(
          PeR[3],
          async (a) =>
            await bot.telegram.sendMessage(data.chatID.log, a, {
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
      console.log(lang.launchLOG("as newest"));
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
      console.log(lang.launchLOG("no response"));

      data.updateTimer = setInterval(checkInterval, 5000);
      database.delete(config.dbkey.request);
      return;
    }
  }, 5000);
}
