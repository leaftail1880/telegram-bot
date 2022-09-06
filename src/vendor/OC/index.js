import { cmd } from "../../app/class/cmdCLS.js";
import { format } from "../../app/class/formatterCLS.js";
import { Query } from "../../app/class/queryCLS.js";
import { ssn } from "../../app/class/sessionCLS.js";
import { Button, Xitext } from "../../app/class/XitextCLS.js";
import { bot } from "../../app/setup/tg.js";

new cmd(
  {
    name: "oc",
    prefix: "def",
    description: "Все действия с OC",
    permisson: 0,
    type: "private",
  },
  (ctx) => {
    ctx.reply(
      ...new Xitext()
        .Text("Выбери действие с ")
        ._Group("OC")
        .Bold()
        .Italic()
        .Underline()
        .Text(":")
        .InlineKeyboard(
          [new Button("Прикрепить").data("OC::reg")],
          [new Button("Найти").data("OC::reg")]
        )
        ._Build()
    );
  }
);

new Query(
  {
    name: "reg",
    prefix: "OC",
    session: 0,
    message: 'hel'
  }, (ctx) => {

  }
)

new Query(
  {
    name: "reg",
    prefix: "OC",
    session: 1,
    message: 'hel'
  }, (ctx) => {
    
  }
)

new Query(
  {
    name: "reg",
    prefix: "OC",
    session: 2,
    message: 'hel'
  }, (ctx) => {
    
  }
)

new Query(
  {
    name: "find",
    prefix: "OC",
    session: 0,
    message: 'hel'
  }, (ctx) => {
    
  }
)

bot.on("document", async (ctx, next) => {
  if (ctx.chat.type != "private" || (await ssn.OC.Q(ctx.from.id)) != 0)
    return next();
  ctx.reply();
  next();
});


