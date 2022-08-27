import { bot, env } from "../../app/setup/tg.js";
import { VERSION } from "../../app/config.js";
import { format } from "../../app/functions/formatterCLS.js";
import { database } from "../../app.js";
import { cmd } from "./index.js";

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
  prefix: 'def',
  description: 'Описание',
  permisson: 0,
  type: 'public'
}, (ctx, args) => {
  
})

*/

new cmd({
  name: 'chat',
  prefix: 'def',
  description: 'Информация о чате',
  permisson: 0,
  type: 'public'
}, (ctx, args) => {
  ctx.reply(
    `Id: ${ctx.chat.id}\nTitle: ${ctx.chat.title ?? 'Пустой'}\nType: ${ctx.chat.type}`
  );
})

new cmd({
  name: 'reg',
  prefix: 'def',
  description: 'Айди выдает',
  permisson: 0,
  type: 'public'
}, (ctx, args) => {
  ctx.reply("Твой айди: " + ctx.message.from.id);
})

new cmd({
  name: 'version',
  prefix: 'def',
  description: 'Версия бота',
  permisson: 0,
  type: 'public'
}, async (ctx, args) => {
  ctx.reply(`Сейчас запущен Кобольдя v${VERSION.join('.')}0${await database.get('bot_session')}\nРежим: ${env.whereImRunning}`);
})

new cmd({
  name: 'db',
  prefix: 'hide',
  description: 'Описание',
  permisson: 1,
  type: 'public'
}, async (ctx, args) => {
  const a = await database.get(args[1])
    ctx.reply(a);
})

new cmd({
  name: 'env',
  prefix: 'hide',
  description: 'В консоль спамит (но это полезный спам!)',
  permisson: 1,
  type: 'public'
}, (ctx, args) => {
  const e = format.stringifyEx(env, " ");
  console.log(e);
})

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