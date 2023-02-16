import {
  fmt,
  link
} from "telegraf/format";
import {
  bot,
  data,
  tables
} from "../../index.js";
import {
  Command
} from "../../lib/Class/Command.js";
import {
  u,
  util
} from "../../lib/Class/Utils.js";

bot.use(async (ctx, next) => {
  if (!ctx.data?.group?.cache?.silentMembers || !ctx.message) return next();

  const silent = ctx.data.group.cache.silentMembers;
  const reply = "reply_to_message" in ctx.message;
  let reason,
  ping_id;
  if (reply) ping_id = ctx.message.reply_to_message.from.id;
  if ("entities" in ctx.message) {
    ctx.message.entities.forEach((e) => {
      if (e.type === "text_mention" && e.user.id in silent) ping_id = e.user.id;
      if (e.type === "mention" && "text" in ctx.message) {
        const text_ping = ctx.message.text.slice(e.offset + 1, e.offset + e.length);
        const user = tables.users.values().find((e) => e.static.nickname === text_ping);
        ping_id = user.static.id;
      }
    });
  }

  reason ??= silent[ping_id];

  if (!reason) return next();
  const dbuser = tables.users.get(ping_id);

  await ctx.forwardMessage(data.chatID.log);
  await ctx.deleteMessage(ctx.message.message_id);
  ctx.reply(
    fmt`${link(util.getName(dbuser), u.httpsUserLink(dbuser.static.nickname))} не упоминается, потому что ${reason}`,
    {
      disable_web_page_preview: true
    }
  );
});


new Command(
  {
    name: "sleep",
    target: "group",
    description: "Режим 'Не беспокоить'",
  },
  (ctx, input) => {
    const members = ctx.data.group.cache.silentMembers;
    const l = link(util.getName(ctx.data.user), u.httpsUserLink(ctx.from.username));
    if (members[ctx.from.id]) {
      ctx.reply(fmt`${l} снова с нами!`, {
        reply_to_message_id: ctx.message.message_id,
        allow_sending_without_reply: true,
        disable_web_page_preview: true,
      });

      delete members[ctx.from.id];
    } else {
      ctx.reply(fmt`${l} отдыхает от чата.`, {
        disable_web_page_preview: true,
      });
      members[ctx.from.id] = input ? input: "так спешил(а), что даже не сказал(а) почему...";
    }

    tables.groups.set(ctx.chat.id, ctx.data.group);
  }
);

function getSleeping(group) {
  const members = group.cache.silentMembers;
  if (Object.keys(members).length < 1) return "Ура, никто не спит.";
  let text = fmt`Спят здесь эти:`;
  for (const [who, why] of Object.entries(members)) {
    const user = tables.users.get(who);
    text = fmt`${text}\n ${link(util.getName(user), u.httpsUserLink(user.static.nickname))} потому что ${why}`;
  }

  return text
}

new Command(
  {
    name: "status",
    description: "Показывает, кто в этом чате не пингуется и почему",
  },
  (ctx) => {
    let text = ''
    if (!ctx.data?.group) {
      const groups = tables.groups.values().filter((e) => e.cache.members.includes(ctx.from.id));
      for (const group of groups) text = fmt`${text}\n\n${group.static.title}\n  ${getSleeping(group)}`;
    } else {
      text = getSleeping(ctx.data.group);
    }

    ctx.reply(text, {
      disable_notification: true, disable_web_page_preview: true
    });
  }
);