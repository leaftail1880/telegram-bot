import { Context } from "telegraf";
import { isAdmin } from "../../app/functions/check.js";
import { bot, groups } from "../../app/setup/tg.js";

const public_cmds = {},
  private_cmds = {},
  hprefixes = [".", "-", "$"],
  types = {
    public: "public",
    groups: "groups",
    gp: "gp",
  };
export class cmd {
  /**
   * Создает команду
   * @param {Object} info
   * @param {String} info.name Имя
   * @param {String} info.prefix def (/) || hide (.-$)
   * @param {String} info.description Описание
   * @param {Number} info.permisson 0 - все, 1 - админы
   * @param {String} info.type public - Доступна всем | groups - Только добавленные группы | gp - Группы и ЛС
   * @param {function(Context, Array)} callback
   */
  constructor(info, callback) {
    if (!info.name) return;
    let prefix,
      CMDtype = "public",
      Ptype = "def";

    // Определение префикса
    if (info.prefix == "hide") Ptype = "hide";

    // Определение типа команды
    if (types[info.type]) CMDtype = types[info.type];

    // Регистрация инфы
    this.info = {
      name: info.name,
      description: info.description ?? "Пусто",
      prefix: {
        type: Ptype,
        pref: prefix,
      },
      type: CMDtype,
      perm: info.permisson ?? 0,
    };
    this.callback = callback;

    if (CMDtype == types.public && Ptype == "def") {
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

bot.on("text", async (ctx) => {
  /**
   * @type {String}
   */
  const t = ctx.message.text;
  if (!t) return;
  let command;
  if (t.startsWith("/")) {
    command = cmd.getCmd(t.split(" ")[0].substring(1), true);
    if (!command) return;
  } else {
    if (
      !t ||
      !hprefixes.find((e) => t.startsWith(e)) ||
      !t.split(" ")[0]?.substring(1)
    )
      return;
    command = cmd.getCmd(t.split(" ")[0].substring(1));
    if (!command) return;
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
      `[Cmd][${ctx.message.from.username ?? ctx.message.from.first_name}][${
        command.info.name
      }] ${t}`
    );
  } catch (e) {
    console.warn(
      `[ERROR][Cmd][${
        command?.info?.name ?? ctx.message.text.split(" ")[0]
      }] ${e}`
    );
  }
});

/**======================ss
 *    Приветствие
 *========================**/
new cmd({ name: "start", description: "Начало работы с ботом в лс" }, (ctx) => {
  ctx.reply("Кобольдя очнулся");
});
/*========================*/

new cmd({ name: "help", description: "Список команд" }, async (ctx) => {
  if (!Object.keys(public_cmds)[0] && !Object.keys(private_cmds)[0])
    return ctx.reply("А команд то и нет");
  let c = [],
    p,
    o;
  c.push(
    Object.values(public_cmds)
      .map((e) => "  /" + e.info.name + " - " + e.info.description)
      .join("\n")
  );
  p = Object.values(private_cmds)
    .filter(async (e) => await cmd.cantUse(e, ctx))
    .map((e) => "  -" + e.info.name + " - " + e.info.description)
    .join("\n");
  o = `${c[0] ? `Доступные везде команды:\n${c}` : ""}\n${
    p ? `\nДоступные вам в этом чате команды:\n${p}` : ""
  }`;
  if (!o) return ctx.reply("А доступных команд то и нет");
  ctx.reply(o);
});

import("./cmds.js").then(() => {
  let o = [];
  Object.keys(public_cmds).forEach((e) =>
    o.push({ command: e, description: public_cmds[e].info.description })
  );
  o = o.filter((e) => e.command != "start" && e.command != "help");

  if (o[0]) bot.telegram.setMyCommands(o);
  console.log(
    `[Load][commands] Кол-во команд: ${o.length}${
      o[0] ? `, список: ${o.map((e) => e.command).join(", ")}` : ""
    }`
  );
});
