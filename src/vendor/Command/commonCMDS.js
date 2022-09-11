import { cmd } from "../../app/class/cmdCLS.js";
import { d, format } from "../../app/class/formatterCLS.js";
import { Xitext } from "../../app/class/XitextCLS.js";
import { abc } from "../../app/functions/abcFNC.js";
import { getGroup, getUser } from "../../app/functions/getUserFNC.js";
import { database } from "../../index.js";
import { c } from "../timeChecker/index.js";
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

new cmd(
  {
    name: "abc",
    description: "Описание",
    permisson: 0,
    type: "all",
  },
  (ctx) => {
    /**
     * @type {import("telegraf/typings/core/types/typegram.js").CommonMessageBundle}
     */
    const msg = ctx.message.reply_to_message;
    if (!msg) return ctx.reply("Отметь сообщение!");
    if (!msg.caption && !msg.text) return ctx.reply("Я не могу это перевести!");
    ctx.reply(abc(msg.text ?? msg.caption), {
      reply_to_message_id: msg.message_id,
      allow_sending_without_reply: true,
    });
  }
);

new cmd(
  {
    name: "call",
    prefix: "def",
    description: "Созывает",
    permisson: 1,
    type: "group",
  },
  async (ctx, args) => {
    /**
     * @type {Array<import("telegraf/typings/core/types/typegram.js").ChatMember>}
     */
    const all = [],
      g = (await getGroup(ctx, true)).group,
      group = g.cache;
    const time = Date.now() - group.lastCall;
    if (time <= 60000) {
      let sec = "секунд",
        hrs = `${time * 1000}`;
      if (hrs.endsWith("1") && hrs != "11") {
        sec = "секунду";
      } else if (hrs == "2" || hrs == "3" || hrs == "4") {
        sec = `секунды`;
      }
      return ctx.reply(
        ...new Xitext()
          .Text(`Подожди еще `)
          ._Group(hrs)
          .Bold()
          .Underline()
          .Text(` ${sec}`)
          ._Build()
      );
    }
    if (!group.members[1]) return ctx.reply("Некого созывать!");
    for (const e of group.members) {
      const obj = await ctx.telegram.getChatMember(ctx.chat.id, e);
      obj.name =
        (await database.get(`User::${e}`, true)).cache.nickname ??
        `${obj.user.first_name}${obj.user.last_name ? obj.user.last_name : ""}`;
      all.push(obj);
    }
    const mbs = all.filter(
      (e) => e.status != "kicked" && e.status != "left" && !c(e.user.id)
    );
    if (all.length != mbs.length) group.members = mbs.map((e) => e.user.id);
    group.lastCall = Date.now();
    for (const e of mbs) {
      const text = new Xitext()
        .Mention(e.name ?? e.user.username, e.user)
        .Text(" ")
        .Text(args[0] ? args.join(" ") : "Созыв!");
      await ctx.reply(...text._Build());
    }
    await database.set(`Group::${g.static.id}`, g, true);
  }
);

new cmd(
  {
    name: "pin",
    prefix: "def",
    description: "Закрепляет на 5 часов",
    permisson: 0,
    type: "all",
  },
  async (ctx, _args, data) => {
    const g = (await getGroup(ctx, true)).group,
      u = data.DBUser ?? (await getUser(ctx, false)).user;
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