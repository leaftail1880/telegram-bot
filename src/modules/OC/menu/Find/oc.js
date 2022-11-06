import { Query } from "../../../../lib/Class/Query.js";
import { Button } from "../../../../lib/Class/Xitext.js";
import { link } from "../../index.js";
import { lang } from "../../index.js";
import { getOCS, noOC, getRefType, sendRef } from "../../utils.js";

new Query(
  {
    name: "oc",
    prefix: "OC",
  },
  async (ctx, data) => {
    const OCS = await getOCS();
    if (!data[1] || !OCS[data[0]]?.map || !OCS[data[0]][data[1]])
      return noOC(ctx);

    const OC = OCS[data[0]][data[1]],
      capt = lang.OC(OC.name, OC.description, data[2], data[3]),
      refType = getRefType(OC.fileid, capt._.text);

    ctx.answerCbQuery(OC.name);
    sendRef(ctx, OC.fileid, capt._.text, capt._.entities, [
      [
        new Button("↩️↩️").data(link("backdoc", refType)),
        new Button("↩️").data(link("uOC", ...data, refType)),
      ],
    ]);
  }
);
