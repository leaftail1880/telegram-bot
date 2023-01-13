import { EventListener } from "../../../lib/Class/Events.js";
import { Query } from "../../../lib/Class/Query.js";
import { ssn } from "../../../lib/Class/Scene.js";
import { util } from "../../../lib/Class/Utils.js";
import { err } from "../../../lib/utils/err.js";
import { lang } from "../index.js";
import { getUserOCs, noCache, oclog, saveOC } from "../utils.js";

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
EventListener("document", 0, async (ctx, next, ow) => {
	if (ssn.OC.state(ow) !== 10) return next();

	ssn.OC.enter(ctx.from.id, 11, ctx.message.document.file_id);
	ctx.reply(lang.edit.name());
	oclog(`> OC. ${util.getNameFromCache(ctx.from)} изменил(а) реф`);
});

ssn.OC.next(10, async (ctx, user) => {
	const uOC = await getUserOCs(ctx.from.id);
	if (noCache(user, uOC)) return err(421, ctx);

	const oc = uOC[user.cache.sceneCache[0]];
	ssn.OC.enter(ctx.from.id, 11, oc.fileid);
	ctx.reply(lang.edit.name());
	oclog(`> OC. ${util.getNameFromCache(ctx.from)} оставил(а) прежний реф`);
});
/*---------------------------------------------------


---------------------------------------------------
//                  2 этап, имя
----------------------------------------------------*/
EventListener("text", 0, async (ctx, next, ow) => {
	if (ssn.OC.state(ow) !== 11) return next();

	if (ctx.message.text.length > 32) return ctx.reply(...lang.maxLength("Имя", 32));

	ssn.OC.enter(ctx.from.id, 12, ctx.message.text);
	ctx.reply(lang.edit.description());
	oclog(`> OC. ${util.getNameFromCache(ctx.from)} изменил(а) имя`);
});

ssn.OC.next(11, async (ctx, user) => {
	const uOC = await getUserOCs(ctx.from.id);
	if (noCache(user, uOC)) return err(421, ctx);

	const oc = uOC[user?.cache?.sceneCache[0]];
	ssn.OC.enter(ctx.from.id, 12, oc.name);
	ctx.reply(lang.edit.description());
	oclog(`> OC. ${util.getNameFromCache(ctx.from)} оставил(а) прежнее имя`);
});
/*---------------------------------------------------


---------------------------------------------------
//                  3 этап, описание
----------------------------------------------------*/
EventListener("text", 0, async (ctx, next, ow) => {
	if (ssn.OC.state(ow) !== 12) return next();

	if (ctx.message.text.length > 4000) return ctx.reply(...lang.maxLength("Описание", 4000));

	saveOC(
		ctx.from.id,
		{
			name: ow.user.cache.sceneCache[2],
			fileid: ow.user.cache.sceneCache[1],
			description: ctx.message.text,
		},
		parseInt(ow.user.cache.sceneCache[0])
	);
	ssn.OC.exit(ctx.from.id);
	ctx.reply(lang.create.done);
});

ssn.OC.next(12, async (ctx, user) => {
	const uOC = await getUserOCs(ctx.from.id);
	if (noCache(user, uOC)) return err(421, ctx);

	const oc = uOC[user?.cache?.sceneCache[0]];

	saveOC(
		ctx.from.id,
		{
			name: user.cache.sceneCache[2],
			fileid: user.cache.sceneCache[1],
			description: oc.description,
		},
		Number(user.cache.sceneCache[0])
	);
	ssn.OC.exit(ctx.from.id);
	ctx.reply(lang.create.done);
});
