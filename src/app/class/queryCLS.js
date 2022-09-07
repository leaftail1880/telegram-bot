import { Context } from "telegraf";
import { bot } from "../setup/tg.js";
import { d } from "./formatterCLS.js";

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
   * @param {Number} info.session Это номер, а префикс сессии = префикс Query
   * @param {String} info.message Сообщение при нажатии (оставьте пустым если не надо)
   * @param {function(Context, Array<String>)} callback
   */
  constructor(info, callback) {
    if (!info?.name) return;

    // Регистрация инфы
    this.info = {
      name: info.name,
      msg: info.message,
      session: info.session,
      perm: info.permisson ?? 0,
    };
    this.callback = callback;

    ques[d.pn(info.prefix, info.name)] = this;
  }
}

export function loadQuerys() {
  bot.on("callback_query", async (ctx, next) => {
    const data = ctx.callbackQuery.data;
    if (!data || !data.includes("::")) return next();
    /**
     * @type {Query}
     */
    const q =
      ques[data] ?? ques[Object.keys(ques).find((e) => data.startsWith(e))];
    if (!q) {
      ctx.answerCbQuery("Ошибка 400!\nОбработчик кнопки не найден", {
        show_alert: true,
      });
      return next();
    }
    try {
      const ret = q.callback(ctx, ctx.callbackQuery.data.split('::'));
      if (ret?.catch)
        ret.catch((e) => {
          console.warn(`PQERR! ${data} ${e?.message ?? e} ${e?.stack}`);
        });
      if (q.info.msg) ctx.answerCbQuery(q.info.msg)
    } catch (error) {
      console.warn(`QERR! ${data} ${error?.message ?? error} ${error?.stack}`);
    }
    console.log(
      `Q ${ctx.callbackQuery.from.username ?? ctx.callbackQuery.from.id} - ${data}`
    );
    next();
  });
}
