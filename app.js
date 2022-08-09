import 'dotenv/config';
import express from "express";
import { Telegraf } from "telegraf";
import { MEMBERS, PORT } from "./config.js";
import { format } from './functions/formatterCLS.js';
import { t } from './functions/timeCLS.js';

// node app
// nodemon app

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
  if (ctx.message.text.startsWith('.')) return
  const ogr = MEMBERS[ctx.message.from.id];
  if (!ogr) return
  //ctx.reply('Дата:\n'+ stringifyEx(ogr, ' '))
  let time = t.ArrrayTime(), ss = Number(ogr.start), ee = Number(ogr.end)
  time[0] = time[0] + ogr.msk ?? 0
  time = Number(`${time[0]}${time[1]}`)
   ctx.reply(`${ss}\n${time}\n${ee}`)
   ctx.reply(`${tt >= ss} ${tt <= ee}`)
  if (tt >= ss || tt <= ee) ctx.deleteMessage(ctx.message.message_id)
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
app.listen(PORT, () => console.log(`My server is running on port ${PORT}`));



// Включить плавную остановку
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))