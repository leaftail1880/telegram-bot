import { Query } from "../../../../lib/Class/Query.js";
import { Button } from "../../../../lib/Class/Xitext.js";
import { link } from "../../index.js";
import { lang } from "../../index.js";
import { getOCS, noOC, getRefType, sendRef } from "../../utils.js";

// Главное меню > Мои персонажи > |Персонаж|
new Query(
  {
    name: "myoc",
    prefix: "OC",
  },
  async (ctx, data) => {
    const OCS = await getOCS();
    if (!OCS[data[0]]?.map || !OCS[data[0]][data[1]]) return noOC(ctx);

    const OC = OCS[data[0]][data[1]],
      capt = lang.myOC(OC.name, OC.description, data[2]),
      refType = getRefType(OC.fileid, capt._.text);

    ctx.answerCbQuery(OC.name);
    sendRef(ctx, OC.fileid, capt._.text, capt._.entities, [
      [new Button("Изменить").data(link("edit", data[1], data[2]))],
      [new Button("Удалить").data(link("del", data[1], refType))],
      [new Button("↩️").data(link("backdoc", refType))],
    ]);
  }
);
