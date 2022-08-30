import { PORT } from "./app/config.js";
import { app } from "./app/setup/tg.js";
import { db } from "./app/setup/db.js";
import { SERVISE_start, SERVISE_stop } from "./app/start-stop.js";

/**======================
 * База данных
 *========================**/
export const database = new db();

app.addListener("error", (error) => {
  console.warn('Error on app: ', error)
  SERVISE_stop("app error")
})

app.get("/healt", (req, res) => res.sendStatus(200));
app.get(`:${PORT}/healt`, (req, res) => res.sendStatus(200))
/**======================
 * Запуск
 *========================**/
app.listen(PORT, () => SERVISE_start());

/**======================
 * Остановка
 *========================**/
process.once("SIGINT", () => SERVISE_stop("SIGINT"));
process.once("SIGTERM", () => SERVISE_stop("SIGTERM"));