import { safeRun } from "../utils/safeRun.js";
import { bot } from "../launch/tg.js";
import { EventListener } from "./Events.js";
import { d, util } from "./Utils.js";
import { editMsg } from "./Menu.js";
import { database } from "../../index.js";

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
      ctx.answerCbQuery(
        "Ошибка 400!\nОбработчик кнопки не найден. Возможно, вы нажали на старую кнопку.",
        {
          show_alert: true,
        }
      );
      console.warn("Cannot find parser for " + data);
      return next();
    }

    activeQueries[data] = Date.now();
    const name = util.getFullName(
      database.cache.tryget(d.user(ctx.callbackQuery.from.id)),
      ctx.callbackQuery.from
    );

    function run() {
      q.callback(
        ctx,
        data.split(d.separator.linkToData)[1]?.split(d.separator.data),
        (text, extra) => editMsg(ctx, ctx.callbackQuery.message, text, extra)
      );
    }

    safeRun("Query", run, ` (${name}: ${data})`, `${name}: ${data}`);
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

new EventListener("modules.load", 0, loadQuerys);
