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
process.on("unhandledRejection", (err) => {
  SERVISE_stop("app error", err)
});


router.use((req, res, next) => {
  res.header('Access-Control-Allow-Methods', 'GET');
  next();
});

router.get('/health', (req, res) => {
  res.status(200).send('Ok');
});

app.use('/api/v1', router);
// app.get('/', )
app.get("/healt", (req, res) => res.sendStatus(200));
// app.get(`:${PORT}/healt`, (req, res) => res.sendStatus(200))


/**======================
 * Запуск
 *========================**/
app.listen(PORT, () => SERVISE_start());

/**======================
 * Остановка
 *========================**/
process.once("SIGINT", () => SERVISE_stop("SIGINT"));
process.once("SIGTERM", () => SERVISE_stop("SIGTERM"));