import "dotenv/config";
import express from "express";
import { Telegraf } from "telegraf";
import { PORT } from "./config.js";


// node app
// nodemon app
let VERSION = [5, 0, 1]
/**======================
 * Инициализация процессов
 *========================**/
const app = express();
export const bot = new Telegraf(process.env.TOKEN);
/*========================*/

/**======================
 *    Приветствие
 *========================**/
bot.start((ctx) => {
  ctx.reply("Кобольдя очнулся");
});
/*========================*/


const Plugins = ["commands"];
for (const plugin of Plugins) {
  const start = Date.now();

  import(`./${plugin}/index.js`)
    .then(() => {
      console.warn(`[loaded] ${plugin} (${Date.now() - start} ms)`);
      count++;
    })
    .catch((error) => {
      console.warn(`[Error][plugin] ${plugin}: ` + error + error.stack);
    });
}


bot.launch();
app.listen(PORT, () =>
  console.log(
    `v${VERSION.join('.')} (${VERSION[2] != 0 ? "Стабильная" : "Тестовая"}), Port ${PORT}`
  )
);

// Включить плавную остановку
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
