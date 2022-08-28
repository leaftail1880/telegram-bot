import { PORT, VERSION } from "./app/config.js";
import { app, bot } from "./app/setup/tg.js";
import { createClient } from "redis";
import { db } from "./app/setup/db.js";

export const Plugins = ["commands", "timeChecker", "updates"],
  database = new db();

/**======================
 * При старте
 *========================**/
app.listen(PORT, async () => {
  console.log(
    `[Load] Обнаружен Кобольдя v${VERSION.join(".")} (${
      VERSION[2] == 0 ? "Стабильная" : "Тестовая"
    }), Порт: ${PORT}`
  );

  /**======================
   * Запуск бота
   *========================**/
  try {
    await bot.launch();
  } catch (error) {
    console.warn('Ошибка при запуске бота: '+ error)
    bot.stop('errorStart')
    return
  }
  bot.catch((error)=>{
    console.log('Ошибка при работе бота: ',error)
    bot.stop('error')
  })

  /**======================
   * Подключение к базе данных
   *========================**/

  const client = createClient({
    url: process.env.REDIS_URL,
  });

  client.on("error", (err) => console.log("[DB][Error] ", err));

  await client.connect();

  database.client = client;

  /**======================
   * Загрузка плагинов
   *========================**/
  for (const plugin of Plugins) {
    const start = Date.now();

    await import(`./vendor/${plugin}/index.js`).catch((error) => {
      console.warn(`[Error][Plugin] ${plugin}: ` + error + error.stack);
    });
    console.log(`[Load] ${plugin} (${Date.now() - start} ms)`);
  }
});

/**======================
 * Остановка процессов
 *========================**/
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
