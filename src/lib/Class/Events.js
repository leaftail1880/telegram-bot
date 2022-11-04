import { getUser } from "../utils/get.js";
import { bot } from "../launch/tg.js";
import config from "../../config.js";
import { data as $data } from "../start-stop.js";

/**
 * @type {Array<Event.CacheUser>}
 */
let GetCache = [];

/**
 * @type {Object<string, Array<Event.Stored>>}
 */
const EVENTS = {};

export class EventListener {
  /**
   *
   * @param {Event.Type} type
   * @param {number} position
   * @param {Event.Callback} callback
   */
  constructor(type, position, callback) {
    let evs = EVENTS[type];
    if (!evs?.map) evs = [];
    let event = { position, callback };
    evs.push(event);
    EVENTS[type] = evs.sort((a, b) => b.position - a.position);
  }
}

function loadEvents(_, next) {
  bot.on("message", async (ctx) => {
    if (ctx.from.is_bot) {
      if (
        ctx.from.id != ctx.botInfo.id ||
        // @ts-ignore
        !ctx.message.text ||
        // @ts-ignore
        !ctx.message.text.includes("--emit")
      )
        return;
    }
    if ($data.benchmark) console.time("Update");
    const Executers = EVENTS.message ? EVENTS.message : [];
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
    if (find && Date.now() - find.time <= config.cacheUpdateTime) {
      console.log("Обработка сообщений...");
      const cache = find.data;
      const R =
        cache.userRights ??
        (await ctx.telegram.getChatMember(ctx.message.chat.id, ctx.from.id));

      data = {
        DBUser: cache.DBUser ?? (await getUser(ctx)),
        user: R.user,
        userRights: R,
      };
    } else {
      const R = await ctx.telegram.getChatMember(
        ctx.message.chat.id,
        ctx.from.id
      );

      data = {
        DBUser: await getUser(ctx),
        user: R.user,
        userRights: R,
      };
    }

    execute(
      ctx,
      Executers.map((e) => e.callback),
      data
    );

    // Removes previos cache
    GetCache = GetCache.filter((e) => e.id !== ctx.from.id);

    // Adds current cache
    GetCache.push({
      id: ctx.from.id,
      data: data,
      time: Date.now(),
    });
    if ($data.benchmark) console.timeEnd("Update");
  });
  next();
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
  // @ts-ignore
  for (const { callback } of EVENTS[type]) callback({}, () => void 0, {});
}

new EventListener("afterpluginload", 0, loadEvents);
