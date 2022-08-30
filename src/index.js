import { PORT } from "./app/config.js";
import { app, router } from "./app/setup/tg.js";
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
  await SERVISE_stop("app error", err, true, false)

  setTimeout(() =>  SERVISE_start(), 5000)
});

app.get("/hp", (req, res) => res.sendStatus(200));



/**======================
 * Запуск
 *========================**/
app.listen(PORT, () => SERVISE_start());

/**======================
 * Остановка
 *========================**/
process.once("SIGINT", () => SERVISE_stop("SIGINT"));
process.once("SIGTERM", () => SERVISE_stop("SIGTERM"));