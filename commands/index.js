import { bot } from "../app.js";
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

commands.push({ command: "chat", description: "Информация о чате" });
bot.command("chat", (ctx) => {
  ctx.reply(`Id: ${ctx.chat.id}\nTitle: ${ctx.chat.title}\nType: ${ctx.chat.type}`)
});


commands.push({ command: "test", description: "Проверка" });
bot.command("test", (ctx) => {
  try {
    const ogr = MEMBERS[ctx.message.from.id];
    if (!ogr) ogr = MEMBERS.default;
    if (ctx.message.text.startsWith("!") && ogr.admin) return;
    let time = t.ArrrayTime(),
      ss = Number(`${Number(ogr.start[0]) + ogr.msk}${ogr.start[1]}`),
      ee = Number(`${Number(ogr.end[0]) + ogr.msk}${ogr.end[1]}`);
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

bot.command("reg", (ctx) => {
  ctx.reply("Твой айди: " + ctx.message.from.id);
});
bot.telegram.setMyCommands(commands);
