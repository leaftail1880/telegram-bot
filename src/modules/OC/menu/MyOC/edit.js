import { EventListener } from "../../../../lib/Class/Events.js";
import { format } from "../../../../lib/Class/Formatter.js";
import { Query } from "../../../../lib/Class/Query.js";
import { ssn } from "../../../../lib/Class/Session.js";
import { err } from "../../../../lib/utils/err.js";
import { not, cacheEmpty } from "../../index.js";
import { lang } from "../../index.js";
import { getOCS, noCache, saveOC } from "../../utils.js";

new Query(
  {
    name: "edit",
    prefix: "OC",
    message: "Редактирование",
  },
  (ctx, data) => {
    ssn.OC.enter(ctx.callbackQuery.from.id, 10, [data[0]], true);
    ctx.reply(...lang.edit0._Build());
  }
);

/*---------------------------------------------------
//                  1 этап, фото
----------------------------------------------------*/
new EventListener("document", 0, async (ctx, next, ow) => {
  if (not(ctx, await ssn.OC.Q(ctx.from.id, true, ow.DBUser), 10)) return next();
  // @ts-ignore
  ssn.OC.enter(ctx.from.id, 11, ctx.message.document.file_id);
  ctx.reply(lang.edit.name());
  console.log(
    `> OC. [${format.getName(ctx.from) ?? ctx.from.id}] redacted reference`
  );
}),
  ssn.OC.next(10, async (ctx, user) => {
    const OCS = await getOCS(),
      uOC = OCS[ctx.from.id];
    if (noCache(user, uOC)) return err(421, ctx);

    const oc = uOC[user.cache.sessionCache[0]];
    ssn.OC.enter(ctx.from.id, 11, oc.fileid);
    ctx.reply(lang.edit.name());
    console.log(
      `> OC. [${format.getName(ctx.from) ?? ctx.from.id}] skipped reference`
    );
  });
/*---------------------------------------------------


---------------------------------------------------
//                  2 этап, имя
----------------------------------------------------*/
new EventListener("text", 0, async (ctx, next, ow) => {
  const qq = await ssn.OC.Q(ctx.from.id, true, ow.DBUser);
  if (not(ctx, qq, 11)) return next();
  if (cacheEmpty(qq)) return err(421, ctx);

  if (ctx.message.text.length > 32)
    return ctx.reply(...lang.maxLength("Имя", 32));

  ssn.OC.enter(ctx.from.id, 12, ctx.message.text);
  ctx.reply(lang.edit.description());
  console.log(
    `> OC. [${format.getName(ctx.from) ?? ctx.from.id}] redacted name`
  );
});

ssn.OC.next(11, async (ctx, user) => {
  const OCS = await getOCS(),
    uOC = OCS[ctx.from.id];
  if (noCache(user, uOC)) return err(421, ctx);
  const oc = uOC[user?.cache?.sessionCache[0]];
  ssn.OC.enter(ctx.from.id, 12, oc.name);
  ctx.reply(lang.edit.description());
  console.log(
    `> OC. [${format.getName(ctx.from) ?? ctx.from.id}] skipped name`
  );
});
/*---------------------------------------------------


---------------------------------------------------
//                  3 этап, описание
----------------------------------------------------*/
new EventListener("text", 0, async (ctx, next, ow) => {
  const qq = await ssn.OC.Q(ctx.from.id, true, ow.DBUser);
  if (not(ctx, qq, 12)) return next();
  if (cacheEmpty(qq, 1)) return err(421, ctx);
  if (ctx.message.text.length > 4000)
    return ctx.reply(...lang.maxLength("Описание", 4000));

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
  const OCS = await getOCS(),
    uOC = OCS[ctx.from.id];
  if (noCache(user, uOC)) return err(422, ctx);

  const oc = uOC[user.cache.sessionCache[0]];

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
