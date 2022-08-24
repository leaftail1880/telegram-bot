import { bot } from "../tg.js";


/**======================ss
 *    Приветствие
 *========================**/
 bot.start((ctx) => {
  ctx.reply("Кобольдя очнулся");
});
/*========================*/

bot.help((ctx) => {
  ctx.telegram.getMyCommands().then(r => ctx.reply(r.map(e=>e.command + ' - ' + e.description).join('\n')))
})