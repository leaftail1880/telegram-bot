import { bot, members } from "../../app/setup/tg.js";

bot.on("document", (ctx, next) => {
  if (ctx.chat.type != "private") return next();
  if (!ctx.message?.caption)
    return ctx.reply("Подпиши OC в формате <Имя> <Описание>");
  ctx.reply("s", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "ы",
            callback_data: "18",
          },
          {
            text: "ы1",
            callback_data: "18",
          },
        ],
        [
          {
            text: "ы2",
            callback_data: "18",
          },
        ],
      ],
    },
  });
  next();
});
