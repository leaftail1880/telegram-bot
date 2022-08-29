import { dbkey, VERSION } from "../../app/config.js";
import { bot, members } from "../../app/setup/tg.js";
import { SERVISE_stop } from "../../app/start-stop.js";
import { database } from "../../index.js";

let session = 0;
(async () => {
  if (!(await database.has(dbkey.session))) {
    await database.set(dbkey.session, 0);
  }

  await database.add(dbkey.session, 1);

  session = await database.get(dbkey.session);

  bot.telegram.sendMessage(members.xiller, `v${VERSION.join(".")}.${session}`);

  setInterval(async () => {
    if ((await database.get(dbkey.session)) > session) SERVISE_stop("new");
  }, 1000);
})();
