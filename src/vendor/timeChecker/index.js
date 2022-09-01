import { bot, members } from "../../app/setup/tg.js";
import { MEMBERS } from "../../config.js";
import { t } from "../../app/functions/timeCLS.js";

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

bot.on("message", (ctx, next) => {
  check(ctx);
  next();
});
//bot.on("sticker", (ctx) => check(ctx));
