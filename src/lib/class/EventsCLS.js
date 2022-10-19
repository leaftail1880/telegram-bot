import { Context } from "telegraf";
import { getUser } from "../functions/getUserFNC.js";
import { bot } from "../setup/tg.js";
import { cacheUpdateTime } from "../../config.js";

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

/**
 * @typedef {Object} cacheUser
 * @property {Number} id
 * @property {Date} time
 * @property {EventData} data
 */

/**
 * @type {Array<cacheUser>}
 */
let GetCache = [];

const EVENTS = {
  options: {
    reqUser: true,
    requser: true,
  },
};

export class EventListener {
  /**
   *
   * @param {"message" | "text" | "document" | "afterpluginload"} type
   * @param {number} lvl
   * @param {function(Context, Function, EventData)} callback
   */
  constructor(type = "text", lvl = 0, callback) {
    /**
     * @type {Array<Event>}
     */
    let evs = EVENTS[type];
    if (!evs?.map) evs = [];
    let event = { callback: callback, lvl: lvl };
    evs.push(event);
    EVENTS[type] = evs.sort((a, b) => b.lvl - a.lvl);
  }
}

export function loadEvents() {
  bot.on("message", async (ctx) => {
    if (ctx.from.is_bot) return
    /**
     * @type {Array<Event>}
     */
    const Executers = [...EVENTS.message] ?? [];
    if (ctx.message.text && EVENTS.text) Executers.push(...EVENTS.text);
    if (ctx.message.document && EVENTS.document)
      Executers.push(...EVENTS.document);
    const data = {};

    // Если да, значит бот обрабатывает сообщения, написанные до его запуска.
    let onLoadMessages = false,
      cache;
    if (GetCache.find((e) => e?.id === ctx.message.from.id)) {
      const find = GetCache.find((e) => e.id === ctx.message.from.id);
      if (Date.now() - find.time <= cacheUpdateTime)
        (onLoadMessages = true), (cache = find.data ?? {});
    }

    if (EVENTS.options.reqUser) {
      const user = onLoadMessages
        ? cache.DBUser ?? (await getUser(ctx, false).user)
        : await getUser(ctx, false).user;
      data.DBUser = user;
    }
    if (EVENTS.options.requser) {
      const user = onLoadMessages
        ? cache.userRights
        : await ctx.telegram.getChatMember(ctx.message.chat.id, ctx.from.id);
      data.userRights = user;
      data.user = user.user;
    }
    execute(
      ctx,
      Executers.map((e) => e.callback),
      data
    );
    GetCache = GetCache.filter((e) => e.id !== ctx.from.id);
    GetCache.push({
      id: ctx.from.id,
      data: data,
      time: Date.now(),
    });
  });
}

function execute(ctx, f, data) {
  if (!f?.map || !f.filter((e) => typeof e === "function")[0]) return;
  f[0](ctx, () => execute(ctx, f.slice(1), data), data);
}

export function emitEvents(type) {
  for (const event of EVENTS[type]) {
    if (typeof event?.callback === 'function') event.callback()
  }
}