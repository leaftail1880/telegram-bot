import { Query } from "../../../../lib/Class/Query.js";
import { Button } from "../../../../lib/Class/Xitext.js";
import { editMsg, link } from "../../index.js";
import { lang } from "../../index.js";
import { getOCS, noOC, sendMsgDelDoc } from "../../utils.js";

new Query(
  {
    name: "uOC",
    prefix: "OC",
  },
  async (ctx, data) => {
    const OCS = await getOCS();
    if (!OCS[data[0]]?.map) return noOC(ctx);

    const btns = [],
      userOCS = OCS[data[0]] ?? [],
      menu = [new Button("↩️").data(link("find", data[1]))];
    for (const [i, e] of userOCS.entries()) {
      if (e)
        btns.push([
          new Button(e.name).data(link("oc", data[0], i, data[2], data[3])),
        ]);
    }
    btns.push(menu);

    ctx.answerCbQuery("ОС " + data[2]);
    if (!data[4])
      editMsg(ctx, lang.userOCS(data[2]), {
        reply_markup: { inline_keyboard: btns },
      });
    else sendMsgDelDoc(ctx, lang.userOCS(data[2]), null, btns, data[4]);
  }
);
