import { bot } from "../../app/setup/tg.js";
import { database } from "../../index.js";
import { cooldown } from "../Command/cmds.js";

setInterval(async () => {
  const groups = (await database.keys((e) => e.startsWith("Group::"))).map(
    (e) => Number(e.split("::")[1])
  ).filter((e) => typeof e == 'number');
  groups.forEach(async (e) => {
    const group = (await database.get(`Group::${e}`, true))
    if (typeof group?.cache?.pin == "string") {
      const id = Number(group.cache.pin.split("::")[0]),
        date = Number(group.cache.pin.split("::")[1]);
      if (!date || !id) return;
      if (date + cooldown <= Date.now()) //
        bot.telegram.unpinChatMessage(group.static.id, id);
    }
  });
}, 5000);
