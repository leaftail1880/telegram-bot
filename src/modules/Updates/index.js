import { EventListener } from "../../lib/Class/Events.js";
import { Subscriptions } from "../../lib/Class/Subscriptions.js";
import { bot } from "../../lib/launch/tg.js";

new EventListener("release", 1, async (_c, next, _d, extra) => {
  const users = await Subscriptions.list("botUpdates");

  for (const user of users) {
    bot.telegram.sendMessage(user, "Обнова бота еее");
  }
});
