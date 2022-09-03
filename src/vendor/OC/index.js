import { Button, Xitext } from "../../app/class/XitextCLS.js";
import { bot } from "../../app/setup/tg.js";

bot.on("document", (ctx, next) => {
  if (ctx.chat.type != "private") return next();
  if (!ctx.message?.caption)
    return ctx.reply("Подпиши OC в формате <Имя> <Описание>");
  ctx.reply(
    ...new Xitext()
      .Text("Тут ")
      ._Group("много")
      .Bold()
      .Italic()
      .Underline()
      .Text(" кнопок!")
      .InlineKeyboard(
        [
          new Button('Кнопочка').data('Ы'),
          new Button('Кнопочка').data('Ы'),
          new Button('Кнопочка').data('Ы')
        ],
        [
          new Button('Кнопочка').data('Ы'),
          new Button('Кнопочка').data('Ы'),
          new Button('Кнопочка').data('Ы')
        ]
      )
      ._Build()
  );
  next();
});

bot.on("callback_query", (ctx, next) => {
  ctx.reply(`Query: ${ctx.callbackQuery}`)
  ctx.answerCbQuery('Ы')
  next()
})
