import { Context } from "telegraf";
import { safeRun } from "../functions/safeRunFNC.js";
import { bot } from "../setup/tg.js";
import { EventListener } from "./EventsCLS.js";
import { d, format } from "./formatterCLS.js";
import { editMsg } from "./menuCLS.js";

/**
 * @type {Object<string, Query>}
 */
const ques = {};
export class Query {
  /**
   * Создает команду
   * @param {Object} info
   * @param {string} info.name Имя
   * @param {string} info.prefix Без ::
   * @param {string} [info.message] Сообщение при нажатии (оставьте пустым если не надо)
   * @param {number} [info.permisson]
   * @param {QueryTypes.Callback} callback
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

function loadQuerys() {
  bot.on("callback_query", async (ctx, next) => {
    const data = ctx.callbackQuery.data;
    if (activeQueries[data] && Date.now() - activeQueries[data] <= 500) {
      activeQueries[data] = Date.now();
      return;
    }
    
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

    safeRun("Query", () => run(), ` (${name}: ${data})`, `${name}: ${data}`);
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

new EventListener("afterpluginload", 0, loadQuerys);
