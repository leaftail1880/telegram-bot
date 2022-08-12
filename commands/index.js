import { bot, env } from "../app.js";
import { MEMBERS } from "../config.js";
import { format } from "../functions/formatterCLS.js";
import { t } from "../functions/timeCLS.js";
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

commands.push({ command: "test", description: "Проверка" });
bot.command("test", (ctx) => {
  try {
    const id = members[ctx.message.from.id];
    let ogr = MEMBERS[id];
    if (!ogr) ogr = MEMBERS.default;
    let c = false;
    ctx.telegram.getChatMember(ctx.chat.id, ctx.message.from.id).then((e) => {
      if (e.status == "administrator" || e.status == "creator") c = true;
    });
    if (ctx.message.text.startsWith("!") && c) return;
    let time = ctx.message?.text?.split(' ')?.slice(1) ?? [10,0],//t.ArrrayTime(),
      ss = Number(`${ogr.start[0]}${ogr.start[1]}`),
      ee = Number(`${ogr.end[0]}${ogr.end[1]}`);
      ctx.reply(time)
    time[0] = time[0] + 3;
    if (time[0] == 24) time[0] = 0;
    if (time[0] == 25) time[0] = 1;
    if (time[0] == 26) time[0] = 2;
    if (`${time[1]}`.length < 2) time[1] = "0" + time[1];
    time = Number(`${time[0]}${time[1]}`);
    //ctx.reply(`Время: (кривой формат)\nНачало: ${ss}\nСейчас: ${time}\nКонец: ${ee}`);
    ctx.reply(
      `Если хотя бы один true, сообщение удалится: ${ss && time >= ss} ${
        time <= ee
      }`
    );
    if ((ss && time >= ss) || time <= ee)
      ctx.deleteMessage(ctx.message.message_id);
  } catch (e) {
    typeof e === "object"
      ? ctx.reply(format.stringifyEx(e, " "))
      : ctx.reply(e);
    console.warn(e);
  }
});

// bot.on("message", (ctx) => {
//     ctx.reply(ctx.message.from.id)
//   const ogr = MEMBERS[ctx.message.from.id];
//   ctx.reply(ogr)
// });
commands.push({ command: "reg", description: "Проверка" });
bot.command("reg", (ctx) => {
  ctx.reply("Твой айди: " + ctx.message.from.id);
  let c = false;
  ctx.telegram.getChatMember(ctx.chat.id, ctx.message.from.id).then((e) => {
    if (e.status == "administrator" || e.status == "creator") c = true;
  });
  ctx.reply("Ты админ: " + c);
});


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
