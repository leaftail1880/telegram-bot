import { PORT, VERSION } from "./app/config.js";
import { app, bot } from "./app/setup/tg.js";
import { createClient } from "redis";
import { db } from "./app/setup/db.js";

export const Plugins = ["hello", "commands"], database = new db();

bot.launch();
app.listen(PORT, () => {
  console.log(
    `v${VERSION.join(".")} (${
      VERSION[2] == 0 ? "Стабильная" : "Тестовая"
    }), Port ${PORT}`
  );
  (async () => {
    // Connect to your internal Redis instance using the REDIS_URL environment variable
    // The REDIS_URL is set to the internal Redis URL e.g. redis://red-343245ndffg023:6379
    const client = createClient({
      url: process.env.REDIS_URL,
    });

    client.on("error", (err) => console.log("Redis Client Error ", err));

    await client.connect();
    database.client = client
    // Send and retrieve some values
    // await client.set("key", "node redis");
    // const value = await client.get("key");

    // console.log("found value: ", value);
  })();
  for (const plugin of Plugins) {
    const start = Date.now();

    import(`./vendor/${plugin}/index.js`)
      .then(() => {
        console.warn(`[loaded] ${plugin} (${Date.now() - start} ms)`);
      })
      .catch((error) => {
        console.warn(`[Error][plugin] ${plugin}: ` + error + error.stack);
      });
  }

});

// Включить плавную остановку
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
