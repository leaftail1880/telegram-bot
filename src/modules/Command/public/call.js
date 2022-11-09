import { database } from "../../../index.js";
import { Command } from "../../../lib/Class/Cmd.js";
import { d, util } from "../../../lib/Class/Utils.js";
import { Xitext } from "../../../lib/Class/Xitext.js";

new Command(
  {
    name: "call",
    description: "Созывает",
    permisson: 1,
    type: "group",
  },
  async (ctx, args, data) => {
    const g = data.Egroup;

    if (!("cache" in g))
      throw new TypeError("Pin cannot be called in non-group chats");

    /**
     * @type {Array<import("telegraf/types").ChatMember>}
     */
    const all = [];

    const group = g.cache;

    const time = Date.now() - group.lastCall;
    if (time <= 60000) {
      const sec = Math.round((60000 - time) / 1000),
        reply = new Xitext()._.group(sec + "")
          .bold()
          .url(null, d.guide(7))
          ._.group()
          .text(" ")
          .text(
            util
              .toSecString(sec, "осталось", "осталась", "осталось")
              .split(" ")
              .slice(1)
              .join(" ")
          );
      return ctx.reply(...reply._.build());
    }
    if (!group.members[1]) return ctx.reply("Некого созывать!");
    for (const e of group.members) {
      const obj = await ctx.telegram.getChatMember(ctx.chat.id, e);
      if (obj.status === "kicked" || obj.status === "left" || obj.user.is_bot)
        continue;
      const text = new Xitext()
        .url(
          (await database.get(`User::${e}`, true)).cache.nickname ??
            `${obj.user.first_name}${
              obj.user.last_name ? obj.user.last_name : ""
            }` ??
            obj.user.username,
          `https://t.me/${obj.user.username}`
        )
        //.Mention(obj.name ?? obj.user.username, obj.user)
        .text(" ")
        .text(args[0] ? args.join(" ") : "Созыв!");
      await ctx.reply(...text._.build());
      all.push(obj);
    }
    const mbs = all.filter((e) => e.status != "kicked" && e.status != "left");
    if (all.length != mbs.length) group.members = mbs.map((e) => e.user.id);
    group.lastCall = Date.now();
    await database.set(`Group::${g.static.id}`, g, true);
  }
);
