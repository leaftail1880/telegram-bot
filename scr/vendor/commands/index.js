import { bot, env } from "../../app/setup/tg.js";
import { MEMBERS, VERSION } from "../../app/config.js";
import { format } from "../../app/functions/formatterCLS.js";
import { t } from "../../app/functions/timeCLS.js";
import { database } from "../../app.js";
const commands = [];
/**================================================================================================
 *                                           КОМАНДЫ
 *  Все самые основные команды бота
 *
 *
 *
 *================================================================================================**/

/*

commands.push({ command: "test", description: "Проверка" });
bot.command("", (ctx) => {
  ctx.reply()
});

*/

let members = {};
env.CUSTOM_MEMBERS.split(",").forEach((e) => {
  members[e.split(":")[0]] = e.split(":")[1];
});

commands.push({ command: "chat", description: "Информация о чате" });
bot.command("chat", (ctx) => {
  ctx.reply(
    `Id: ${ctx.chat.id}\nTitle: ${ctx.chat.title}\nType: ${ctx.chat.type}`
  );
});

commands.push({ command: "reg", description: "Айди выдаеьт" });
bot.command("reg", (ctx) => {
  try {
    ctx.reply("Твой айди: " + ctx.message.from.id);
  } catch (e) {
    console.log(e);
  }
});

commands.push({ command: "version", description: "Версия бота" });
bot.command("version", (ctx) => {
  try {
    ctx.reply(`Сейчас запущен Кобольдя v${VERSION.join(' ')}\nРежим: ${env.whereImRunning}`);
  } catch (e) {
    console.log(e);
  }
});

//commands.push({ command: "reg", description: "Айди выдаеьт" });
bot.command("db", async (ctx) => {
  
  try {
    const a = await database.get(ctx.message.text.split(' ')[1])
    ctx.reply(a);
  } catch (e) {
    console.log(e);
  }
});

bot.on("message", (ctx) => {
  if (!ctx.message.text || ctx.message.text != "-env") return;
  try {
    const e = format.stringifyEx(env, " ");
    console.log(e);
  } catch (e) {
    console.log(e);
  }
});

async function check(ctx) {
  try {
    const id = members[ctx.message.from.id];
    let ogr = MEMBERS[id];
    if (!ogr) ogr = MEMBERS.default;
    let c = false;
    const e = await ctx.telegram.getChatMember(
      ctx.chat.id,
      ctx.message.from.id
    );
    if (e.status == "administrator" || e.status == "creator") c = true;
    if (ctx.message.text && ctx.message.text.startsWith("!") && c) return;
    let time = t.ArrrayTime(),
      ss = Number(`${ogr.start[0]}${ogr.start[1]}`),
      ee = Number(`${ogr.end[0]}${ogr.end[1]}`);
    time[0] = time[0] + 3;
    if (time[0] == 24) time[0] = 0;
    if (time[0] == 25) time[0] = 1;
    if (time[0] == 26) time[0] = 2;
    if (`${time[1]}`.length < 2) time[1] = "0" + time[1];
    time = Number(`${time[0]}${time[1]}`);
    let q = ss != 0 && time >= ss;
    if (q || time <= ee) ctx.deleteMessage(ctx.message.message_id);
  } catch (e) {
    console.warn(e);
  }
}

bot.on("message", (ctx) => check(ctx));
bot.on("sticker", (ctx) => check(ctx));

// let calls = 0
// commands.push({ command: "call", description: "Общий сбор" });
// bot.command("reg", (ctx) => {
//   let c = false;
//   ctx.telegram.getChatMember(ctx.chat.id, ctx.message.from.id).then((e) => {
//     if (e.status == "administrator" || e.status == "creator") c = true;
//     ctx.telegram.getChatMember(ctx.chat.id)
//     ctx.
//   });
// });

bot.telegram.setMyCommands(commands);
