import { PORT } from "./config.js";
import { app } from "./app/setup/tg.js";
import { db } from "./app/setup/db.js";
import { SERVISE_start, SERVISE_stop } from "./app/start-stop.js";

/**======================
 * База данных
 *========================**/
export const database = new db();

/**======================
 * Всякая хрень
 *========================**/
process.on("unhandledRejection", async (err) => {
  if (err?.response?.error_code === 409) {
    SERVISE_stop("Запущено два экземпляра", null, true, false);
  } else SERVISE_stop(err.message ? err.message : 'App error: ', err.stack ? err.stack : err, true, true);
});

app.get("/healt", (_req, res) => res.sendStatus(200));

/**======================
 * Запуск
 *========================**/
app.listen(PORT, () => SERVISE_start());

/**======================
 * Остановка
 *========================**/
process.once("SIGINT", () => SERVISE_stop("SIGINT"));
process.once("SIGTERM", () => SERVISE_stop("SIGTERM"));
