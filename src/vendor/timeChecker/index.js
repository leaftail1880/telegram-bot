import { bot, env, members } from "../../app/setup/tg.js";
import { MEMBERS } from "../../config.js";
import { t } from "../../app/class/timeCLS.js";
import { Context } from "telegraf";

export function c(ID, Ttime) {
  let set = MEMBERS[Object.keys(members).find((e) => members[e] == ID)];
  if (!set) set = MEMBERS.default;
  let MessageTime = Ttime ?? t.ArrrayTime(),
    StartTime = Number(`${set.start[0]}${set.start[1]}`),
    EndTime = Number(`${set.end[0]}${set.end[1]}`),
    GMT = env.local ? 0 : 3;
  MessageTime[0] = MessageTime[0] + GMT + set.GMT;
  if (MessageTime[0] >= 24) MessageTime[0] = MessageTime[0] - 24;
  if (`${MessageTime[1]}`.length < 2) MessageTime[1] = "0" + MessageTime[1];
  MessageTime = Number(`${MessageTime[0]}${MessageTime[1]}`);
  const qStart = (MessageTime <= StartTime || StartTime <= 600), qEnd = MessageTime >= EndTime, q = qStart && qEnd  
  return false;
}

/**
 *
 * @param {Context} ctx
 * @returns
 */
function Ttime(ctx) {
  const time = new Date(ctx.message.date * 1000);
  return [time.getHours(), time.getMinutes()];
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
    if (c(ctx.message.from.id, Ttime(ctx)))
      ctx.deleteMessage(ctx.message.message_id),
        console.log(
          `[Delete] ${ctx.message.from.username} ${ctx.message.text}`
        );
  } catch (e) {
    console.warn(e);
  }
}

bot.on("message", (ctx, next) => {
  check(ctx);
  next();
});
