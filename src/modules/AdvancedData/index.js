import { database } from "../../index.js";
import { d } from "../../lib/Class/Utils.js";
import { EventListener } from "../../lib/Class/Events.js";
import config from "../../config.js";
import { getGroup, getUser } from "./utils.js";
import "./queries.js";

/**
 * @type {Object<string, Event.CacheUser>}
 */
const PreviousGet = {};

new EventListener("message", 10, async (ctx, next, _DATA) => {
  /** @type {Event.Data} */
  let data;

  // Бот обрабатывает много сообщений, берем данные из кэша.
  const find = PreviousGet[ctx.message.from.id];
  if (
    find &&
    Date.now() - find.time <= config.cache.updateTime &&
    find.data.Euser &&
    find.data.userRights &&
    find.data.user
  ) {
    data = find.data;
  } else {
    const DBUser = await getUser(ctx);

    if (DBUser === false) return;

    const R = await ctx.telegram.getChatMember(
      ctx.message.chat.id,
      ctx.from.id
    );

    data = {
      Euser: DBUser,
      user: R.user,
      userRights: R,
    };
  }

  if (ctx.chat.type === "group" || ctx.chat.type === "supergroup") {
    const group = await getGroup(ctx);

    if (group === false) return;

    data.Egroup = group;
  }

  if (data.Euser.needSafe) {
    delete data.Euser.needSafe;
    await database.set(d.user(ctx.from.id), data.Euser, true);
  }

  _DATA = data;

  // Adds current GET
  PreviousGet[ctx.from.id] = {
    data: data,
    time: Date.now(),
  };

  next();
});
