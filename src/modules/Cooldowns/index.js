import { d } from "../../lib/class/formatterCLS.js";
import { bot } from "../../lib/setup/tg.js";
import { data, SERVISE} from "../../lib/start-stop.js";
import { database } from "../../index.js";
import { cooldown } from "../Command/index.js";

setInterval(async () => {
  if (data.stopped || !database.client) return;
  const groups = (await database.keys((e) => e.startsWith("Group::")))
    .map((e) => Number(e.split("::")[1]))
    .filter((e) => typeof e === "number");
  groups.forEach(async (e) => {
    const group = await database.get(d.group(e), true);
    if (typeof group?.cache?.pin === "string") {
      const id = Number(group.cache.pin.split("::")[0]),
        date = Number(group.cache.pin.split("::")[1]);
      if (!date || !id) return;
      if (date + cooldown <= Date.now()) {
        const result = bot.telegram.unpinChatMessage(group.static.id, id);
        result.catch((e) => SERVISE.error(e));
        delete group.cache.pin;
        await database.set(d.group(e), group, true);
      }
    }
  });
}, 5000);
