import { EventListener } from "../../../lib/Class/Events.js";
import { Query } from "../../../lib/Class/Query.js";
import { ssn } from "../../../lib/Class/Session.js";
import { log } from "../../../lib/SERVISE.js";
import { err } from "../../../lib/utils/err.js";
import { cacheEmpty, lang, not } from "../index.js";
import { getNameFromCache, saveOC } from "../utils.js";

new Query(
	{
		name: "reg",
		prefix: "OC",
		message: "Регистрация",
	},
	(ctx) => {
		ssn.OC.enter(ctx.callbackQuery.from.id, 0);
		ctx.reply(...lang.reg0._.build({ disable_web_page_preview: true }));
	}
);

// 1 этап, фото
new EventListener("document", 0, async (ctx, next, ow) => {
	const qq = await ssn.OC.Q(ctx.from.id, true, ow.user);
	if (not(ctx, qq, 0)) return next();
	ssn.OC.enter(ctx.from.id, 1, [ctx.message.document.file_id], true);
	ctx.reply(lang.create.name);
	log(`> OC. ${getNameFromCache(ctx.from)} отравил(а) реф`);
});

// 2 этап, имя
new EventListener("text", 0, async (ctx, next, ow) => {
	const qq = await ssn.OC.Q(ctx.from.id, true, ow.user);
	if (not(ctx, qq, 1)) return next();
	if (cacheEmpty(qq)) return err(420, ctx);
	if (ctx.message.text.length > 32) return ctx.reply(...lang.maxLength("Имя", 32));

	ssn.OC.enter(ctx.from.id, 2, ctx.message.text);
	ctx.reply(lang.create.description);
	log(`> OC. ${getNameFromCache(ctx.from)} отправил(а) имя`);
});

// 3 этап - описание
new EventListener("text", 0, async (ctx, next, ow) => {
	const qq = await ssn.OC.Q(ctx.from.id, true, ow.user);
	if (not(ctx, qq, 2) || typeof qq !== "object") return next();
	if (cacheEmpty(qq, 1)) return err(420, ctx);
	if (ctx.message.text.length > 4000) return ctx.reply(...lang.maxLength("Описание", 4000));

	saveOC(ctx.from.id, {
		name: qq.user.cache.sessionCache[1],
		fileid: qq.user.cache.sessionCache[0],
		description: ctx.message.text,
	});
	ssn.OC.exit(ctx.from.id);
	ctx.reply(lang.create.done);
});
