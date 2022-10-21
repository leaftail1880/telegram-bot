import { db } from "./lib/setup/db.js";
import {
  handleError,
  SERVISE,
} from "./lib/start-stop.js";

/**======================
 * База данных
 *========================**/
export const database = new db();

/**======================
 * Всякая хрень
 *========================**/
process.on("unhandledRejection", handleError);

/**======================
 * Запуск
 *========================**/
SERVISE.start();

/**======================
 * Остановка
 *========================**/
process.once("SIGINT", () => SERVISE.stop("SIGINT"));
process.once("SIGTERM", () => SERVISE.stop("SIGTERM"));
