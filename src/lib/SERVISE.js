import { createClient } from "redis";
import config from "../config.js";
import { database } from "../index.js";
import "./Class/Cmd.js";
import { triggerEvent } from "./Class/Events.js";
import { d, util } from "./Class/Utils.js";
import "./Class/Query.js";
import { Xitext } from "./Class/Xitext.js";
import { bot, env } from "./launch/tg.js";
import { bigger, updateSession, updateVisualVersion } from "./launch/utils.js";

/** @type {NodeJS.Timer} */
let updateTimer;

export const data = {
  v: config.version.join("."),

  /** @type {'work' | 'realese' | 'old'} */
  latest: "realese",
  publicVersion: `v${config.version.join(".")}`,
  logVersion: `v${config.version.join(".")} I`,
  start_time: Date.now(),
  session: 0,

  launched: false,
  stopped: false,

  development: env.dev || env.dev == "true" ? true : false,
  benchmark: true,
  private: true,

  chatID: {
    // Айди чата, куда будут поступать сообщения
    owner: Number(env.ownerID),
    log: Number(env.logID),
  },
  /** @type {Object<number, 'accepted' | 'waiting'>} */
  joinCodes: {},
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

export function log(msg, extra = {}, owner = false) {
  console.log(msg);
  owner
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
  await database._.connect(client, time);

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
  triggerEvent("modules.load");

  /**======================
   * Запуск бота
   *========================**/
  await bot.launch();
  data.launched = true;

  lang.log.end(m);
  updateTimer = setInterval(checkInterval, config.update.timerTime);
}

async function checkInterval() {
  if (!database.client) return;
  const query = await database.get(config.dbkey.request, true);
  if (!query?.map) return;
  /**
   * @type {typeof data.latest}
   */
  const q = bigger(
    [config.version[0], config.version[1], config.version[2]],
    query,
    ["realese", "old", "work"]
  );

  function answer(message) {
    return database.set(config.dbkey.request, message);
  }

  if (data.development && q !== "work") return await answer("development");

  if (q === "realese") return await answer("terminate_you");

  if (q === "old" || q === "work") {
    await answer("terminate_me");
    return SERVISE.stop(lang.stop.old(), "ALL");
  }
}

/**
 *
 * @param {string} reason
 * @param {"ALL" | "BOT" | "none"} type
 * @param {boolean} message
 */
async function stop(reason = "Остановка", type = "none", message = true) {
  clearTimeout(updateTimer);
  const text = new Xitext()._.group("✕  ")
    .url(null, "https://t.me")
    .bold()
    ._.group();

  text.text(`${type}. `);

  text.text(reason);

  console.log(text._.text);
  if (data.launched && message)
    await bot.telegram.sendMessage(data.chatID.log, ...text._.build());

  if (type !== "none" && data.launched && !data.stopped) {
    data.stopped = true;
    bot.stop(reason);
  }

  if (type === "ALL") {
    await database._.close();
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

    if (!data.launched) return;

    await bot.telegram.sendMessage(data.chatID.log, ...text._.build());

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
  clearInterval(updateTimer);
  if (data.launched)
    await bot.telegram.sendMessage(data.chatID.log, ...lang.stop.freeze()),
      console.log(lang.stop.freeze()[0]);

  if (data.launched && !data.stopped) {
    data.stopped = true;
    bot.stop("freeze");
  }

  function updateRequest() {
    return database.set(
      config.dbkey.request,
      [config.version[0], config.version[1], config.version[2]],
      true,
      300
    );
  }

  await updateRequest();

  let times = 0,
    devTimes = 0;
  const timeout = setInterval(async () => {
    const answer = await database.get(config.dbkey.request);
    if (answer === "terminate_you") {
      await database.delete(config.dbkey.request);
      return SERVISE.stop(lang.stop.terminate(), "ALL");
    }

    if (answer === "terminate_me") {
      await launch("As newest", "Запущена как новая");
      return;
    }
    if (answer === "development") {
      console.log(
        `(${devTimes === 0 ? times : devTimes}) Waiting for end of dev...`
      );
      devTimes++;
      times = 0;
      updateRequest();
      return;
    }

    times++;
    console.log("No response", times);
    if (times >= 3) {
      await launch("No response", "Нет ответа", "↩️");
      return;
    }
  }, config.update.timerTime);

  /**
   *
   * @param {string} log
   * @param {...string} chat
   */
  async function launch(log, ...chat) {
    clearInterval(timeout);
    if (data.stopped === false) return;
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
    data.launched = true;
    console.log(lang.logLaunch(log));
    bot.telegram.sendMessage(data.chatID.log, ...lang.start(chat));

    updateTimer = setInterval(checkInterval, config.update.timerTime);
    database.delete(config.dbkey.request);
  }
}
