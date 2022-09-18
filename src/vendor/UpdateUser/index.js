import { database } from "../../index.js";
import { getGroup, getUser } from "../../app/functions/getUserFNC.js";
import { d, format } from "../../app/class/formatterCLS.js";
import { EventListener } from "../../app/class/EventsCLS.js";

new EventListener("message", 10, async (ctx, next, data) => {
  const user = data.DBUser ?? (await getUser(ctx, false)).user;
  if (ctx.chat.type == "group" || ctx.chat.type == "supergroup") {
    const g = await getGroup(ctx, false),
      group = g.group;
    if (group.static.id !== ctx.chat.id)
      (group.static.id = ctx.chat.id), (g.saveG = true);
    if (!group.cache.members.includes(user.static.id))
      (group.cache.members = format.add(group.cache.members, user.static.id)),
        (g.saveG = true);
    if (g.saveG) database.set(d.group(ctx.chat.id), group, true);
  }
  user.static.name = format.getName(ctx.from);
  user.static.nickname = ctx.from.username;
  user.cache.lastActive = Date.now();
  data.DBUser = user;
  await database.set(d.user(ctx.from.id), user, true);
  next();
});
