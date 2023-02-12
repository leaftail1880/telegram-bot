import { fmt, link } from "telegraf/format";
import { bot, data, tables } from "../../index.js";
import { u, util } from "../../lib/Class/Utils.js";

bot.use(async (ctx, next) => {
	if (!ctx.message) return next();

	const silent = ctx.data.group.cache.silentMembers;
	const reply = "reply_to_message" in ctx.message;
	let reason, ping_id;
	if (reply) ping_id = ctx.message.reply_to_message.from.id;
	if ("entities" in ctx.message) {
		ctx.message.entities.forEach((e) => {
			if (e.type === "text_mention" && e.user.id in silent) ping_id = e.user.id;
			if (e.type === "mention" && "text" in ctx.message) {
				const text_ping = ctx.message.text.slice(e.offset + 1, e.offset + e.length);
				const user = tables.users.values().find((e) => e.static.nickname === text_ping);
				ping_id = user.static.id;
			}
		});
	}

	reason ??= silent[ping_id];

	if (!reason) return next();
	const dbuser = tables.users.get(ping_id);

	await ctx.forwardMessage(data.chatID.log);
	await ctx.deleteMessage(ctx.message.message_id);
	ctx.reply(
		fmt`${link(util.getName(dbuser), u.httpsUserLink(dbuser.static.nickname))} не упоминается, потому что ${reason}`,
		{ disable_web_page_preview: true }
	);
});
