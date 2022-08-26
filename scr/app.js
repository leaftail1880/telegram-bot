import { PORT, VERSION } from "./config.js";
import { app, bot } from "./tg.js";

const Plugins = ["hello", "commands"];
for (const plugin of Plugins) {
  const start = Date.now();

  import(`./${plugin}/index.js`)
    .then(() => {
      console.warn(`[loaded] ${plugin} (${Date.now() - start} ms)`);
    })
    .catch((error) => {
      console.warn(`[Error][plugin] ${plugin}: ` + error + error.stack);
    });
}

bot.launch();
app.listen(PORT, () =>
  console.log(
    `v${VERSION.join(".")} (${
      VERSION[2] == 0 ? "Стабильная" : "Тестовая"
    }), Port ${PORT}`
  )
);

// Включить плавную остановку
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
