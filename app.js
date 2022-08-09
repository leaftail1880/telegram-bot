import "dotenv/config";
import express from "express";
import { Telegraf } from "telegraf";
import { MEMBERS, PORT } from "./config.js";
import { format } from "./functions/formatterCLS.js";
import { t } from "./functions/timeCLS.js";

// node app
// nodemon app
let VERSION = 1,
  IsStable = true;
/**======================
 * Инициализация процессов
 *========================**/
const app = express();
const bot = new Telegraf(process.env.TOKEN);
/*========================*/

/**======================
 *    Приветствие
 *========================**/
bot.start((ctx) => {
  ctx.reply("Кобольдя очнулся");
});
/*========================*/

/**================================================================================================
 *                                           КОМАНДЫ
 *  Все самые основные команды бота
 *
 *
 *
 *================================================================================================**/
bot.command("test", (ctx) => {
  try {
    if (ctx.message.text.startsWith(".")) return;
    const ogr = MEMBERS[ctx.message.from.id];
    if (!ogr) return;
    let time = t.ArrrayTime(),
      ss = Number(ogr.start),
      ee = Number(ogr.end);
    time[0] = time[0] + ogr.msk ?? 0;
    time = Number(`${time[0]}${time[1]}`);
    ctx.reply(`${ss}\n${time}\n${ee}`);
    ctx.reply(`state: ${tt >= ss} ${tt <= ee}`);
    if ((time >= ss && ss != 0) || time <= ee)
      ctx.deleteMessage(ctx.message.message_id);
  } catch (e) {
    ctx.reply(format.stringifyEx(e, ' '))
  }
});

bot.command("time", (ctx) => {
  ctx.reply(t.shortTime());
});

// bot.on("message", (ctx) => {
//     ctx.reply(ctx.message.from.id)
//   const ogr = MEMBERS[ctx.message.from.id];
//   ctx.reply(ogr)
// });

bot.command("reg", (ctx) => {
  ctx.reply("Твой айди: " + ctx.message.from.id);
});

bot.launch();
app.listen(PORT, () =>
  console.log(
    `Port ${PORT}, version ${VERSION} (${IsStable ? "Стабильная" : "Тестовая"})`
  )
);

// Включить плавную остановку
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
