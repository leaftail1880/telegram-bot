import { Context } from "telegraf";
import { isAdmin } from "../../app/functions/checkFNC.js";
import { bold, italic, text_parse } from "../../app/functions/textFNC.js";
import { bot, groups } from "../../app/setup/tg.js";
import { data } from "../../app/start-stop.js";

const public_cmds = {},
  private_cmds = {},
  hprefixes = [".", "-", "$"];
export class cmd {
  /**
   * Создает команду
   * @param {Object} info
   * @param {String} info.name Имя
   * @param {String} info.prefix def (/) || hide (.-$)
   * @param {String} info.description Описание
   * @param {Number} info.permisson 0 - все, 1 - админы
   * @param {Array<import("telegraf/typings/core/types/typegram.js").BotCommandScope>} info.scopes
   * @param {function(Context, Array)} callback
   */
  constructor(info, callback) {
    if (!info.name) return;
    let prefix,
      Ptype = "def";

    // Определение префикса
    if (info.prefix == "hide") Ptype = "hide";

    // Регистрация инфы
    this.info = {
      name: info.name,
      description: info.description ?? "Пусто",
      prefix: {
        type: Ptype,
        pref: prefix,
      },
      scopes: info.scopes,
      perm: info.permisson ?? 0,
    };
    this.callback = callback;

    if (info.scopes && Ptype == "def") {
      public_cmds[info.name] = this;
    } else {
      private_cmds[info.name] = this;
    }
  }
  static getCmd(msg, isDefCmd) {
    if (!msg) return false;
    /**
     * @type {cmd}
     */
    let cmd;
    if (isDefCmd) {
      cmd =
        public_cmds[
          Object.keys(public_cmds).find(
            (e) => e == msg || e == msg.split("@")[0]
          )
        ];
    } else {
      cmd =
        private_cmds[
          Object.keys(private_cmds).find(
            (e) => e == msg || e == msg.split("@")[0]
          )
        ];
    }
    if (!cmd) return false;
    return cmd;
  }
  static async cantUse(command, ctx) {
    let _a = command.info.type == "groups" && !groups[ctx.chat.id],
      _b =
        command.info.type == "gp" &&
        !groups[ctx.chat.id] &&
        ctx.chat.type != "private",
      _c =
        (command.info.perm == 1 &&
          ctx.chat.type != "private" &&
          !(await isAdmin(ctx, ctx.message.from.id))) ||
        (command.info.perm == 2 && id == members.xiller);
    return _a && _b && _c;
  }
}

bot.on("text", async (ctx, next) => {
  /**
   * @type {String}
   */
  const t = ctx.message.text;
  if (!t) return next();
  let command;
  if (t.startsWith("/")) {
    command = cmd.getCmd(t.split(" ")[0].substring(1), true);
    if (!command) return next();
  } else {
    if (
      !t ||
      !hprefixes.find((e) => t.startsWith(e)) ||
      !t.split(" ")[0]?.substring(1)
    )
      return next();
    command = cmd.getCmd(t.split(" ")[0].substring(1));
    if (!command) return next();
    if (await cmd.cantUse(command, ctx))
      return ctx.reply(
        "У вас нет разрешений для использования этой команды. Список доступных команд: /help"
      );
  }

  try {
    const a = t
      .match(/"[^"]+"|[^\s]+/g)
      .map((e) => e.replace(/"(.+)"/, "$1").toString());
    a.shift();
    command.callback(ctx, a);
    console.log(
      `${ctx.message.from.username ?? ctx.message.from.id}: ${t} (${
        command.info.name
      })`
    );
  } catch (e) {
    console.warn(
      `ERR! ${command?.info?.name ?? ctx.message.text.split(" ")[0]} ${e}`
    );
  }
  next();
});

/**======================ss
 *    Приветствие
 *========================**/
new cmd(
  {
    name: "start",
    description: "Начало работы с ботом в лс",
    scopes: [
      {
        type: "all_private_chats",
      },
    ],
  },
  (ctx) => {
    ctx.reply("Кобольдя очнулся");
  }
);
/*========================*/

new cmd(
  {
    name: "help",
    description: "Список команд",
    scopes: [
      {
        type: "default",
      },
    ],
  },
  async (ctx) => {
    if (!Object.keys(public_cmds)[0] && !Object.keys(private_cmds)[0])
      return ctx.reply("А команд то и нет");
    let c = false,
      p = false,
      a = [];

    Object.values(public_cmds).forEach((e) => {
      if (!c) a.push(`Доступные везде команды:\n`), (c = true);
      a.push(`  /${e.info.name}`);
      a.push(italic(` - ${e.info.description}\n`));
    });

    Object.values(private_cmds)
      .filter(async (e) => !(await cmd.cantUse(e, ctx)))
      .forEach((e) => {
        if (!p) a.push(`\nДоступные вам в этом чате команды:\n`), (p = true);
        a.push(`  `);
        a.push(bold(`-${e.info.name}`));
        a.push(italic(` - ${e.info.description}\n`));
      });
    let o = text_parse(a);
    if (!o.newtext) return ctx.reply("А доступных команд то и нет");
    ctx.reply(o.newtext, { entities: o.extra });
  }
);

import("./cmds.js").then(() => {
  let o = [],
    allKmds = [];
  Object.keys(public_cmds).forEach((e) => {
    const cmd = public_cmds[e];
    if (cmd.info.scopes)
      cmd.info.scopes.forEach((e) =>
        bot.telegram.setMyCommands(
          [{ command: cmd.info.name, description: cmd.info.description }],
          { scope: e }
        )
      );
    allKmds.push(e);
  });
  Object.keys(private_cmds).forEach((e) => allKmds.push(e));

  if (o[0]) {
  }
  if (data.isDev)
    console.log(
      `> Command Кол-во команд: ${allKmds.length}${
        allKmds[0] ? `, список: ${allKmds.join(", ")}` : ""
      }`
    );
});
