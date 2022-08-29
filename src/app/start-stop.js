import { PORT, VERSION } from "./config.js";
import { bot } from "./setup/tg.js";
import { createClient } from "redis";
import { database } from "../index.js";

/**======================
 * Плагины
 *========================**/
const Plugins = ["commands", "timeChecker", "updates"];

/**
 * Запуск бота
 * @returns {void}
 */
export async function SERVISE_start() {
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
    console.warn("Ошибка при запуске бота: " + error);
    SERVISE_stop("errorStart");
    return;
  }
  bot.catch((error) => {
    console.log("Ошибка при работе бота: ", error);
    SERVISE_stop("error");
  });

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
}

export async function SERVISE_stop(reason) {
  await bot.telegram.sendMessage(
    members.xiller,
    `Бот остановлен. Причина: ${reason}`
  );
  bot.stop(reason)
  process.exit(0)
}
