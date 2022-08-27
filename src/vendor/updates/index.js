import { dbkey, VERSION } from "../../app/config.js";
import { bot, members } from "../../app/setup/tg.js";
import { database } from "../../app.js";

(async () => {
  if (!(await database.has(dbkey.session))) {
    await database.set(dbkey.session, 0);
  }
  bot.telegram.sendMessage(
    members.xiller,
    `v${VERSION.join(".")}0${await database.get(dbkey.session)}`
  );
  await database.add(dbkey.session, 1);
})();
