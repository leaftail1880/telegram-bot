import { Command } from "../../lib/class/cmdCLS.js";
import { d, format } from "../../lib/class/formatterCLS.js";
import { Xitext } from "../../lib/class/XitextCLS.js";
import { abc } from "../../lib/functions/abcFNC.js";
import { getGroup, getUser } from "../../lib/functions/getUserFNC.js";
import { database } from "../../index.js";
import { chatcooldown } from "./index.js";

/**================================================================================================
 *                                           КОМАНДЫ
 *  Все самые основные команды бота
 *
 *
 *
 *================================================================================================**/
/*

new cmd({
  name: '',
  specprefix: false,
  description: 'Описание',
  permisson: 0,
  hide: false,
  type: 'all'
}, (ctx, args, data, command) => {
  
})
*/

function getLink(search) {
  const p = new URLSearchParams();
  p.append("q", search);
  return "https://google.com/search?" + p.toString();
}

new Command(
  {
    name: "google",
    description: "Гуглит",
    type: "all",
    hide: true,
  },
  (ctx, args) => {
    /**
     * @type {{text?: string; caption?: string; message_id?: number}}
     */
    const msg = ctx.message.reply_to_message;
    const text = msg.text ?? args.join(" ");
    if (!text)
      return ctx.reply("И что я по твоему загуглить должен?", {
        reply_to_message_id: ctx.message.message_id,
        allow_sending_without_reply: true,
      });
    const x = new Xitext().Url(text, getLink(text));
    ctx.reply(
      ...x._Build({
        reply_to_message_id:
          ctx.message.reply_to_message?.message_id ?? ctx.message.message_id,
        allow_sending_without_reply: true,
      })
    );
  }
);

new Command(
  {
    name: "abc",
    description: "Переводит",
    permisson: 0,
    type: "all",
  },
  (ctx) => {
    /**
     * @type {{text?: string; caption?: string; message_id?: number}}
     */
    const msg = ctx.message.reply_to_message;
    if (!msg)
      return ctx.reply("Отметь сообщение!", {
        reply_to_message_id: ctx.message.message_id,
        allow_sending_without_reply: true,
      });
    if (!msg.caption && !msg.text) return ctx.reply("Я не могу это перевести!");
    ctx.reply(abc(msg.text ?? msg.caption), {
      reply_to_message_id: msg.message_id,
      allow_sending_without_reply: true,
    });
  }
);

new Command(
  {
    name: "call",
    description: "Созывает",
    permisson: 1,
    type: "group",
  },
  async (ctx, args) => {
    /**
     * @type {Array<import("telegraf/types").ChatMember>}
     */
    const all = [],
      g = (await getGroup(ctx, true)).group,
      group = g.cache;
    const time = Date.now() - group.lastCall;
    if (time <= 60000) {
      const sec = Math.round((60000 - time) / 1000),
        reply = new Xitext()
          ._Group(sec)
          .Bold()
          .Url(null, d.guide(7))
          ._Group()
          .Text(" ")
          .Text(
            format
              .toSecString(sec, "осталось", "осталась", "осталось")
              .split(" ")
              .slice(1)
              .join(" ")
          );
      return ctx.reply(...reply._Build({ disable_web_page_preview: true }));
    }
    if (!group.members[1]) return ctx.reply("Некого созывать!");
    for (const e of group.members) {
      const obj = await ctx.telegram.getChatMember(ctx.chat.id, e);
      if (
        obj.status === "kicked" ||
        obj.status === "left" ||
        obj.user.is_bot
      )
        continue;
      const text = new Xitext()
        .Url(
          (await database.get(`User::${e}`, true)).cache.nickname ??
            `${obj.user.first_name}${
              obj.user.last_name ? obj.user.last_name : ""
            }` ??
            obj.user.username,
          `https://t.me/${obj.user.username}`
        )
        //.Mention(obj.name ?? obj.user.username, obj.user)
        .Text(" ")
        .Text(args[0] ? args.join(" ") : "Созыв!");
      await ctx.reply(...text._Build({ disable_web_page_preview: true }));
      all.push(obj);
    }
    const mbs = all.filter(
      (e) => e.status != "kicked" && e.status != "left"
    );
    if (all.length != mbs.length) group.members = mbs.map((e) => e.user.id);
    group.lastCall = Date.now();
    await database.set(`Group::${g.static.id}`, g, true);
  }
);

new Command(
  {
    name: "pin",
    description: "Закрепляет на 5 часов",
    permisson: 0,
    type: "all",
  },
  async (ctx, _args, data) => {
    const g = (await getGroup(ctx, true)).group,
      u = data.DB.User ?? (await getUser(ctx, false)).user;
    let lp = 0;
    if (typeof g?.cache?.lastPin == "object") {
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
      return ctx.reply(...reply._Build({ disable_web_page_preview: true }));
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