import { Context } from "telegraf";
import { safeRun } from "../functions/safeRunFNC.js";
import { bot } from "../setup/tg.js";
import { log, SERVISE_error } from "../start-stop.js";
import { d, format } from "./formatterCLS.js";
import { editMsg } from "./menuCLS.js";

/**
 * @type {Object<String, Query>}
 */
const ques = {};
export class Query {
  /**
   * Создает команду
   * @param {Object} info
   * @param {String} info.name Имя
   * @param {String} info.prefix Без ::
   * @param {String} info.message Сообщение при нажатии (оставьте пустым если не надо)
   * @param {function(Context, Array<String>, function(String, import("telegraf/typings/telegram-types.js").ExtraEditMessageText))} callback
   */
  constructor(info, callback) {
    if (!info?.name) return;

    // Регистрация инфы
    this.info = {
      name: info.name,
      msg: info.message,
      perm: info.permisson ?? 0,
    };
    this.callback = callback;

    ques[d.queryREGISTER(info.prefix, info.name)] = this;
  }
}

const activeQueries = {};

export function loadQuerys() {
  bot.on("callback_query", async (ctx, next) => {
    const data = ctx.callbackQuery.data;
    if (activeQueries[data] && Date.now() - activeQueries[data] <= 500) {
      activeQueries[data] = Date.now();
      return;
    }
    /**
     * @type {Query}
     */
    const q = ques[data.split(d.separator.linkToData)[0]];
    if (!q) {
      ctx.answerCbQuery("Ошибка 400!\nОбработчик кнопки не найден", {
        show_alert: true,
      });
      console.warn("No btn parser for " + data);
      return next();
    }

    activeQueries[data] = Date.now();
    const name =
      format.getName(ctx.callbackQuery.from) ?? ctx.callbackQuery.from.id;

    function run() {
      q.callback(
        ctx,
        data.split(d.separator.linkToData)[1]?.split(d.separator.data),
        (text, extra) => editMsg(ctx, ctx.callbackQuery.message, text, extra)
      );
    }

    safeRun(
      "Query",
      () => run(),
      ` (${name}: ${data})`,
      `${name}: ${data}`
    );
    if (q.info.msg) ctx.answerCbQuery(q.info.msg);
  });
}

new Query(
  {
    name: "delmsg",
    prefix: "all",
    message: "Выход...",
  },
  (ctx) => {
    ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  }
);
