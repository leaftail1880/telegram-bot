import { database } from "../../../index.js";
import { Command } from "../../../lib/Class/Cmd.js";
import { d, format } from "../../../lib/Class/Formatter.js";
import { Xitext } from "../../../lib/Class/Xitext.js";
import { chatcooldown } from "../index.js";

new Command(
  {
    name: "pin",
    description: "Закрепляет на 5 часов",
    permisson: 0,
    type: "group",
  },
  async (ctx, _args, data) => {
    const g = data.DBGroup;

    if (!("cache" in g))
      throw new TypeError("Pin cannot be called in non-group chats");

    const u = data.DBUser;
    let lp = 0;
    if (typeof g?.cache?.lastPin === "object") {
      lp = g.cache?.lastPin[u.static.id];
    } else g.cache.lastPin = {};

    const time = Date.now() - lp;

    if (time <= chatcooldown) {
      const min = Math.round((chatcooldown - time) / 60000),
        reply = new Xitext()
          ._Group(min)
          .Bold()
          .Url(null, d.guide(7))
          ._Group()
          .Text(" ")
          .Text(
            format
              .toMinString(min, "осталось", "осталась", "осталось")
              .split(" ")
              .slice(1)
              .join(" ")
          );
      return ctx.reply(...reply._Build());
    }
    if (!ctx.message?.reply_to_message?.message_id) {
      const text = new Xitext()
        .Bold("Отметь")
        .Text(" сообщение которое хочешь закрепить!");
      return ctx.reply(text._text, {
        reply_to_message_id: ctx.message.from.id,
        allow_sending_without_reply: true,
        entities: text._entities,
      });
    }
    if (g.cache.pin)
      try {
        await ctx.unpinChatMessage(Number(g.cache.pin.split("::")[0]));
      } catch (error) {
        console.warn(error);
      }

    ctx.pinChatMessage(ctx.message.reply_to_message.message_id, {
      disable_notification: true,
    });
    g.cache.lastPin[u.static.id] = Date.now();
    g.cache.pin = `${ctx.message.reply_to_message.message_id}::${Date.now()}`;
    await database.set(`Group::${g.static.id}`, g, true);
  }
);
