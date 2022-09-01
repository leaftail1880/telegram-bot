import { bot, env, members } from "../../app/setup/tg.js";
import { MEMBERS } from "../../config.js";
import { t } from "../../app/functions/timeCLS.js";
import { Context } from "telegraf";

export function c(ID) {
  let set = MEMBERS[Object.keys(members).find(e => members[e] == ID)]
  if (!set) return //set = MEMBERS.default
  let
    time = t.ArrrayTime(),
    ss = Number(`${set.start[0]}${set.start[1]}`),
    ee = Number(`${set.end[0]}${set.end[1]}`), usd = env.local ? 0 : 3;
  time[0] = time[0] + usd + set.msk
  if (time[0] >= 24) time[0] = time[0] - 24;
  if (`${time[1]}`.length < 2) time[1] = "0" + time[1];
  time = Number(`${time[0]}${time[1]}`);
  let q = ss != 0 && time >= ss;
  if (q || time <= ee) return true;
}

/**
 * 
 * @param {Context} ctx 
 * @returns 
 */
async function check(ctx) {
  try {
    let ca = false;
    const e = await ctx.telegram.getChatMember(
      ctx.chat.id,
      ctx.message.from.id
    );
    if (e.status == "administrator" || e.status == "creator") ca = true;
    if (ctx.message.text && ctx.message.text.startsWith("!") && ca) return;
    if (c(ctx.message.from.id)) ctx.deleteMessage(ctx.message.message_id), console.log(`[Delete] ${ctx.message.from.username} ${ctx.message.text}`);
  } catch (e) {
    console.warn(e);
  }
}

bot.on("message", (ctx, next) => {
  check(ctx);
  next();
});
