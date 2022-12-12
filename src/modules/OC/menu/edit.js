import { InternalListener } from "../../../lib/Class/Events.js";
import { Query } from "../../../lib/Class/Query.js";
import { ssn } from "../../../lib/Class/Session.js";
import { bot } from "../../../lib/launch/tg.js";
import { log } from "../../../lib/SERVISE.js";
import { err } from "../../../lib/utils/err.js";
import { cacheEmpty, lang, not } from "../index.js";
import { getNameFromCache, getUserOCs, noCache, saveOC } from "../utils.js";

new Query(
	{
		name: "edit",
		prefix: "OC",
		message: "Редактирование",
	},
	(ctx, data) => {
		ssn.OC.enter(ctx.callbackQuery.from.id, 10, [data[0]], true);
		ctx.reply(...lang.edit0._.build());
	}
);

/*---------------------------------------------------
//                  1 этап, фото
----------------------------------------------------*/
InternalListener("document", 0, async (ctx, next, ow) => {
	if (not(ctx, await ssn.OC.Q(ctx.from.id, true, ow.user), 10)) return next();
	// @ts-ignore
	ssn.OC.enter(ctx.from.id, 11, ctx.message.document.file_id);
	ctx.reply(lang.edit.name());
	log(`> OC. ${getNameFromCache(ctx.from)} изменил(а) реф`);
});

ssn.OC.next(10, async (ctx, user) => {
	const uOC = await getUserOCs(ctx.from.id);
	if (noCache(user, uOC)) return err(421, ctx);

	const oc = uOC[user.cache.sessionCache[0]];
	ssn.OC.enter(ctx.from.id, 11, oc.fileid);
	ctx.reply(lang.edit.name());
	log(`> OC. ${getNameFromCache(ctx.from)} оставил(а) прежний реф`);
});
/*---------------------------------------------------


---------------------------------------------------
//                  2 этап, имя
----------------------------------------------------*/
InternalListener("text", 0, async (ctx, next, ow) => {
	const qq = await ssn.OC.Q(ctx.from.id, true, ow.user);
	if (not(ctx, qq, 11)) return next();
	if (cacheEmpty(qq)) return err(421, ctx);

	if (ctx.message.text.length > 32) return ctx.reply(...lang.maxLength("Имя", 32));

	ssn.OC.enter(ctx.from.id, 12, ctx.message.text);
	ctx.reply(lang.edit.description());
	log(`> OC. ${getNameFromCache(ctx.from)} изменил(а) имя`);
});

ssn.OC.next(11, async (ctx, user) => {
	const uOC = await getUserOCs(ctx.from.id);
	if (noCache(user, uOC)) return err(421, ctx);

	const oc = uOC[user?.cache?.sessionCache[0]];
	ssn.OC.enter(ctx.from.id, 12, oc.name);
	ctx.reply(lang.edit.description());
	log(`> OC. ${getNameFromCache(ctx.from)} оставил(а) прежнее имя`);
});
bot.on("text", (ctx) => {
	err(1, ctx);
});
/*---------------------------------------------------


---------------------------------------------------
//                  3 этап, описание
----------------------------------------------------*/
InternalListener("text", 0, async (ctx, next, ow) => {
	const qq = await ssn.OC.Q(ctx.from.id, true, ow.user);
	if (not(ctx, qq, 12)) return next();
	if (cacheEmpty(qq, 1)) return err(421, ctx);
	if (ctx.message.text.length > 4000) return ctx.reply(...lang.maxLength("Описание", 4000));

	saveOC(
		ctx.from.id,
		{
			// @ts-ignore
			name: qq.user.cache.sessionCache[2],
			// @ts-ignore
			fileid: qq.user.cache.sessionCache[1],
			description: ctx.message.text,
		},
		// @ts-ignore
		qq.user.cache.sessionCache[0]
	);
	ssn.OC.exit(ctx.from.id);
	ctx.reply(lang.create.done);
});

ssn.OC.next(12, async (ctx, user) => {
	const uOC = await getUserOCs(ctx.from.id);
	if (noCache(user, uOC)) return err(421, ctx);

	const oc = uOC[user?.cache?.sessionCache[0]];

	saveOC(
		ctx.from.id,
		{
			name: user.cache.sessionCache[2],
			fileid: user.cache.sessionCache[1],
			description: oc.description,
		},
		Number(user.cache.sessionCache[0])
	);
	ssn.OC.exit(ctx.from.id);
	ctx.reply(lang.create.done);
});
