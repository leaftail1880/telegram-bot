import { PORT } from "./config.js";
import { app } from "./app/setup/tg.js";
import { db } from "./app/setup/db.js";
import {
  handleError,
  SERVISE_start,
  SERVISE_stop,
} from "./app/start-stop.js";
import { Change } from "./app/site/index.js";

/**======================
 * База данных
 *========================**/
export const database = new db();

/**======================
 * Всякая хрень
 *========================**/
process.on("unhandledRejection", handleError);
app.get("/healt", (_req, res) => res.sendStatus(200));
app.get("/healtz", (_req, res) => res.sendStatus(200));
app.get("/hp", (_req, res) => res.sendStatus(200));
app.get("/", (_req, res) => res.type("html").send(Change.site));

/**======================
 * Запуск
 *========================**/
app.listen(PORT, () => SERVISE_start());

/**======================
 * Остановка
 *========================**/
process.once("SIGINT", () => SERVISE_stop("SIGINT"));
process.once("SIGTERM", () => SERVISE_stop("SIGTERM"));
