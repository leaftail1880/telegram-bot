import { database } from "../../index.js";
import { d, util } from "../../lib/Class/Utils.js";
import { EventListener } from "../../lib/Class/Events.js";
import { CreateGroup } from "../../lib/utils/models.js";

/**
 * @type {Object<string, Event.CacheUser>}
 */
const GetCache = {};

new EventListener("message", 10, async (ctx, next, data) => {
    /** @type {Event.Data} */
    let data;
   
    let speed = false;

    const find = GetCache[ctx.message.from.id];
    if (find && Date.now() - find.time <= config.cache.updateTime) {
        // Бот обрабатывает много сообщений, берем данные из кэша.
        speed = true;
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
    

    
  if (ctx.chat.type === "group" || ctx.chat.type === "supergroup") {
    /**
     * @type {DB.Group}
     */
    let group = await database.get(d.group(ctx.chat.id), true);
    let update = false;

    if (!group) {
      group = CreateGroup(ctx.chat.id, ctx.chat.title, [ctx.from.id]);
      update = true;
    }

    if (group.static.id !== ctx.chat.id) {
      group.static.id = ctx.chat.id;
      update = true;
    }

    if (!group.cache.members.includes(ctx.from.id)) {
      group.cache.members = util.add(group.cache.members, ctx.from.id);
      update = true;
    }

    if (group.static.title != ctx.chat.title) {
      group.static.title = ctx.chat.title;
      update = true;
    }

    if (update) database.set(d.group(ctx.chat.id), group, true);
    data.DBGroup = group;
  }
  const user = data.DBUser;
  const detectUpdate = (_1, _2) =>
    _1 != _2 ? ((_1 = _2), (user.needSafe = true)) : "";

  detectUpdate(user.static.name, util.getName(ctx.from));
  detectUpdate(user.static.nickname, ctx.from.username);

  data.DBUser = user;

  if (user.needSafe) {
    delete data.DBUser.needSafe;
    await database.set(d.user(ctx.from.id), user, true);
  }
  
    // Removes previos cache
    GetCache = GetCache.filter((e) => e.id !== ctx.from.id);

    // Adds current cache
    GetCache.push({
        id: ctx.from.id,
        data: data,
        time: Date.now(),
    });
  
  
  next();
});
