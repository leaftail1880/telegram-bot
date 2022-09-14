import { errRespCodes, PORT } from "./config.js";
import { app } from "./app/setup/tg.js";
import { db } from "./app/setup/db.js";
import {
  SERVISE_error,
  SERVISE_freeze,
  SERVISE_start,
  SERVISE_stop,
} from "./app/start-stop.js";

/**======================
 * База данных
 *========================**/
export const database = new db(),
  eros = ["TypeError", "SyntaxError", "Socket closed unexpectedly"];

/**======================
 * Всякая хрень
 *========================**/
process.on("unhandledRejection", async (err) => {
  if (err?.response?.error_code === 409) {
    SERVISE_freeze();
  } else if (errRespCodes.includes(err?.response?.error_code)) {
    SERVISE_error(err);
  } else if (
    err?.stack &&
    err.stack.split(":")[0] &&
    eros.includes(err.stack.split(":")[0])
  ) {
    SERVISE_error(err);
  } else
    SERVISE_stop(
      err,
      true,
      true
    );
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
