import { Context } from "telegraf";
import { getUser } from "../functions/getUserFNC.js";
import { bot } from "../setup/tg.js";

const EVENTS = {
  options: {
    reqUser: true,
    requser: true,
  },
};

/**
 * @typedef {Object} Event
 * @property {Number} lvl
 * @property {function(Context, function(...any))} callback
 */

/**
 * @typedef {Object} EventData
 * @property {import("../models.js").DBUser} DBUser
 * @property {import("telegraf/typings/core/types/typegram.js").ChatMember} userRights
 * @property {import("telegraf/typings/core/types/typegram.js").User} user
 */

export class EventListener {
  /**
   *
   * @param {"message" | "text" | "document"} type
   * @param {number} lvl
   * @param {function(Context, Function, EventData)} callback
   * @param {Object} options
   * @param {Boolean} options.reqUser
   * @param {Boolean} options.requser
   */
  constructor(type = "text", lvl = 0, callback, options = {}) {
    /**
     * @type {Array<Event>}
     */
    let evs = EVENTS[type];
    if (!evs?.map) evs = [];
    let event = { callback: callback, lvl: lvl };
    if (options.requser)
      (event.requser = true), (EVENTS.options.requser = true);
    if (options.reqUser)
      (event.reqUser = true), (EVENTS.options.reqUser = true);
    evs.push(event);
    EVENTS[type] = evs.sort((a, b) => b.lvl - a.lvl);
  }
}

export function loadEvents() {
  bot.on("message", async (ctx) => {
    /**
     * @type {Array<Event>}
     */
    const Executers = [...EVENTS.message] ?? [];
    if (ctx.message.text && EVENTS.text) Executers.push(...EVENTS.text);
    if (ctx.message.document && EVENTS.document) Executers.push(...EVENTS.document);
    const data = {};
    if (EVENTS.options.reqUser) {
      const user = await getUser(ctx, false);
      data.DBUser = user.user;
    }
    if (EVENTS.options.requser) {
      const user = await ctx.telegram.getChatMember(
        ctx.message.chat.id,
        ctx.from.id
      );
      data.userRights = user;
      data.user = user.user;
    }
    execute(
      ctx,
      Executers.map((e) => e.callback),
      data
    );
  });
}

function execute(ctx, f, data) {
  if (!f?.map || !f.filter((e) => typeof e === "function")[0]) return;
  f[0](ctx, () => execute(ctx, f.slice(1), data), data);
}
