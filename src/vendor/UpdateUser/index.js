import { database } from "../../index.js";
import { getGroup, getUser } from "../../app/functions/getUserFNC.js";
import { format } from "../../app/class/formatterCLS.js";
import { bot } from "../../app/setup/tg.js";

bot.on("message", async (ctx, next) => {
  if (ctx.message.from.is_bot) return;
  const u = await getUser(ctx, false),
    user = u.user;
  if (ctx.chat.type == "group" || ctx.chat.type == "supergroup") {
    const g = await getGroup(ctx, false),
      group = g.group;
    if (!group.cache.members.includes(user.static.id))
      (group.cache.members = format.add(group.cache.members, user.static.id)),
        (g.saveG = true);
    if (g.saveG) database.set(`Group::${group.static.id}`, group, true);
  }
  user.cache.lastActive = Date.now();
  database.set(`User::${user.static.id}`, user, true);
  next();
});
