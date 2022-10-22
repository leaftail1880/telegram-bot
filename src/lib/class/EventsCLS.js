import { getUser } from "../functions/getUserFNC.js";
import { bot } from "../setup/tg.js";
import config from "../../config.js";
const { cacheUpdateTime } = config
/**
 * @type {Array<Event.CacheUser>}
 */
let GetCache = [];

/**
 * @type {Object<string, Array<Event.Stored>>}
 */
const EVENTS = {};

export class EventListener {
  constructor(type = "text", lvl = 0, callback) {
    let evs = EVENTS[type];
    if (!evs?.map) evs = [];
    let event = { lvl: lvl, callback: callback };
    evs.push(event);
    EVENTS[type] = evs.sort((a, b) => b.lvl - a.lvl);
  }
}

function loadEvents() {
  bot.on("message", async (ctx) => {
    if (ctx.from.is_bot) return;
    const Executers = EVENTS.message ? [...EVENTS.message] : [];
    // @ts-ignore
    if (ctx.message.text && EVENTS.text) Executers.push(...EVENTS.text);
    // @ts-ignore
    if (ctx.message.document && EVENTS.document)
      Executers.push(...EVENTS.document);
    /**
     * @type {Event.Data}
     */
    let data;

    // Если да, значит бот обрабатывает сообщения, написанные до его запуска.
    const find = GetCache.find((e) => e.id === ctx.message.from.id);
    if (find && Date.now() - find.time <= cacheUpdateTime) {
      const cache = find.data;
      const R =
        cache.userRights ??
        (await ctx.telegram.getChatMember(ctx.message.chat.id, ctx.from.id));
      data = {
        DBUser: cache.DBUser ?? (await getUser(ctx, false)).user,
        user: R.user,
        userRights: R,
      };
    } else {
      const R = await ctx.telegram.getChatMember(
        ctx.message.chat.id,
        ctx.from.id
      );
      data = {
        DBUser: (await getUser(ctx, false)).user,
        user: R.user,
        userRights: R,
      };
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

/**
 * @template T
 * @param {T} ctx
 * @param {Array<function>} f
 * @param {Event.Data} data
 * @returns
 */
function execute(ctx, f, data) {
  if (!f?.map || !f.filter((e) => typeof e === "function")[0]) return;
  f[0](ctx, () => execute(ctx, f.slice(1), data), data);
}

/**
 * 
 * @param {Event.Type} type 
 */
export function emitEvents(type) {
  for (const event of EVENTS[type]) {
    if (typeof event?.callback === "function") event.callback();
  }
}

new EventListener("afterpluginload", 0, loadEvents);
