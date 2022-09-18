import { Context } from "telegraf";
import { d } from "./formatterCLS.js";
import { Button } from "./XitextCLS.js";

export class MultiMenuV1 {
  static get config() {
    return {
      maxRows: 12,
      maxButtonsPerRow: 6,
      backButtonSymbol: "↩️",
    };
  }
  constructor(prefix) {
    this.prefix = prefix;
    this.config = MultiMenuV1.config;
  }
  /**
   *
   * @param {Context} ctx
   * @param {String} text
   * @param {import("telegraf/typings/telegram-types.js").ExtraEditMessageText} extra
   * @param {Array<Array<import("telegraf/typings/core/types/typegram.js").InlineKeyboardButton>>} InlineKeyboard
   */
  async editMsgFromQuery(ctx, text, extra, InlineKeyboard) {
    await editMsg(ctx, ctx.callbackQuery.message, text, extra, InlineKeyboard);
  }
  /**
   *
   * @param {String} methodName
   * @param  {...String} args
   * @returns {String}
   */
  link(methodName, ...args) {
    return d.query(this.prefix, methodName, ...args);
  }
  /**
   *
   * @param {Context} ctx
   * @param {*} qq
   * @param {Number} session
   * @returns
   */
  notPrivateChat(ctx, qq, session) {
    return (
      ctx.chat.type !== "private" || qq === "not" || qq.session !== session
    );
  }
  /**
   *
   * @param {import("../models.js").DBUser} user
   * @param {number} lvl
   * @returns
   */
  isCacheEmpty(user, lvl = 0) {
    return !user?.cache?.sessionCache?.map || !user?.cache?.sessionCache[lvl];
  }
  generatePageSwitcher(
    buttons,
    backButton = null,
    methodName,
    pageTo = 1,
    buttonLimit = this.config.maxRows
  ) {
    const page = Number(pageTo)
    const qNext = Math.ceil(buttons.length / buttonLimit) - 1 >= page;
    const qBack = page > 1;
    const start = buttonLimit * page - buttonLimit, end = buttonLimit * page
    const btns = buttons.slice(start, end);
    const menu = [];
    if (backButton) menu.push(backButton)

    if (qBack)
      menu.unshift(new Button("«").data(this.link(methodName, page - 1)));
    if (qNext) menu.push(new Button("»").data(this.link(methodName, page + 1)));
    btns.push(menu);

    return btns;
  }
}

export async function editMsg(ctx, message, text, extra, InlineKeyboard) {
  if (typeof extra === "object" && InlineKeyboard)
    extra.reply_markup.inline_keyboard = InlineKeyboard;
  await ctx.telegram.editMessageText(
    message.chat.id,
    message.message_id,
    null,
    text,
    extra
  );
}