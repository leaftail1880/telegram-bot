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
   * @param {function(Context)} callback
   */
  constructor(info, callback) {
    if (!info?.name) return;

    // Регистрация инфы
    this.info = {
      name: info.name,
      msg: info.message ?? "Пусто",
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
    const q = ques[data];
    if (!q) {
      ctx.answerCbQuery("Ошибка 400!", {
        show_alert: true,
      });
      return next();
    }
    try {
      const ret = q.callback(ctx);
      if (ret?.catch)
        ret.catch((e) => {
          console.warn(`PQERR! ${data} ${e?.message ?? e} ${e?.stack}`);
        });
    } catch (error) {
      console.warn(`QERR! ${data} ${error?.message ?? error} ${error?.stack}`);
    }
    console.log(
      `${ctx.callbackQuery.from.username ?? ctx.callbackQuery.from.id}: ${data}`
    );
    next();
  });
}
