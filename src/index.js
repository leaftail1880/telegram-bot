import { db } from "./lib/setup/db.js";
import { handlers, SERVISE } from "./lib/start-stop.js";

/**======================
 * База данных
 *========================**/
export const database = new db();

/**======================
 * Всякая хрень
 *========================**/
process.on("unhandledRejection", handlers.processError);

/**======================
 * Запуск
 *========================**/
SERVISE.start();

/**======================
 * Остановка
 *========================**/
process.once("SIGINT", () => SERVISE.stop("SIGINT"));
process.once("SIGTERM", () => SERVISE.stop("SIGTERM"));
