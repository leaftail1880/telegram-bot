import { Query } from "../../../../lib/Class/Query.js";
import { Button } from "../../../../lib/Class/Xitext.js";
import { editMsg, link } from "../../index.js";
import { lang } from "../../index.js";
import { getOCS, noOC } from "../../utils.js";

// Главное меню > Мои персонажи
new Query(
  {
    name: "my",
    prefix: "OC",
  },
  async (ctx) => {
    const OCS = await getOCS(),
      q = ctx.callbackQuery;
    if (!OCS[q.from.id]?.map) return noOC(ctx);

    const btns = [],
      userOCS = OCS[q.from.id],
      menu = [new Button("↩️").data(link("back"))];
    for (const [i, e] of userOCS.entries()) {
      if (e)
        btns.push([
          new Button(e.name).data(link("myoc", q.from.id, i, q.from.username)),
        ]);
    }
    btns.push(menu);

    ctx.answerCbQuery("Ваши персонажи");
    editMsg(ctx, lang.myOCS, {
      reply_markup: { inline_keyboard: btns },
    });
  }
);
