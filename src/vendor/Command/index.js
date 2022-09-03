import { Context } from "telegraf";
import { Xitext } from "../../app/class/XitextCLS.js";
import { isAdmin } from "../../app/functions/checkFNC.js";
import { bot, members } from "../../app/setup/tg.js";
import { data } from "../../app/start-stop.js";

const public_cmds = {},
  private_cmds = {},
  hprefixes = [".", "-", "$"];
/**
 * @typedef {String} CommandType
 * @property {String} group
 * @property {String} private
 * @property {String} all
 */

export class cmd {
  /**
   * Создает команду
   * @param {Object} info
   * @param {String} info.name Имя
   * @param {String} info.prefix def (/) || hide (.-$)
   * @param {String} info.description Описание
   * @param {Number} info.permisson 0 - все, 1 - админы
   * @param {CommandType} info.type all | group | private
   * @param {function(Context, Array)} callback
   */
  constructor(info, callback) {
    if (!info.name) return;
    let type = "def";

    // Определение префикса
    if (info.prefix == "hide") type = "hide";

    // Регистрация инфы
    this.info = {
      name: info.name,
      description: info.description ?? "Пусто",
      type: info.type,
      perm: info.permisson ?? 0,
    };
    this.callback = callback;

    if (info.type && type == "def") {
      public_cmds[info.name] = this;
    } else {
      private_cmds[info.name] = this;
    }
  }
  /**
   *
   * @param {String} msg
   * @param {boolean} isDefCmd
   * @returns {cmd}
   */
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
  /**
   *
   * @param {cmd} command
   * @param {Context} ctx
   * @returns
   */
  static async cantUse(command, ctx) {
    // Условия разрешений
    let _lg = // Где
        command.info.type == "group" &&
        (ctx.chat.type == "group" || ctx.chat.type == "supergroup"),
      _lp = command.info.type == "private" && ctx.chat.type == "private",
      _lc = command.info.type == "channel" && ctx.chat.type == "channel",
      _la = command.info.type == "all",
      // Если команда для админов, и отправитель админ
      _pall = command.info.perm == 0,
      _padmin =
        command.info.perm == 1 && (await isAdmin(ctx, ctx.message.from.id)),
      // Если команда хильки
      _pxiller =
        command.info.perm == 2 && ctx.message.from.id == members.xiller;

    // Если нет ни одного разрешения, значит нельзя
    return !(_la || _lc || _lg || _lp) && !(_pall || _padmin || _pxiller);
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
    try {
      const ret = command.callback(ctx, a);
      if (ret?.catch)
        ret.catch((e) => {
          console.warn(
            `PERR! ${command?.info?.name ?? ctx.message.text.split(" ")[0]} ${e}`
          );
        });
    } catch (error) {
      console.warn(
        `ERR! ${command?.info?.name ?? ctx.message.text.split(" ")[0]} ${e}`
      );
    }

    console.log(
      `${ctx.message.from.username ?? ctx.message.from.id}: ${t} (${
        command.info.name
      })`
    );
  } catch (e) {}
  next();
});

/**======================ss
 *    Приветствие
 *========================**/
new cmd(
  {
    name: "start",
    description: "Начало работы с ботом в лс",
    type: "private",
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
    type: "all",
  },
  async (ctx) => {
    if (!Object.keys(public_cmds)[0] && !Object.keys(private_cmds)[0])
      return ctx.reply("А команд то и нет");
    let c = false,
      p = false,
      a = new Xitext();

    Object.values(public_cmds).forEach((e) => {
      if (!c) a.Text(`Доступные везде команды:\n`), (c = true);
      a.Text(`  /${e.info.name}`);
      a.Italic(` - ${e.info.description}\n`);
    });

    Object.values(private_cmds)
      .filter(async (e) => !(await cmd.cantUse(e, ctx)))
      .forEach((e) => {
        if (!p) a.Text(`\nДоступные вам в этом чате команды:\n`), (p = true);
        a.Text(`  `);
        a.Mono(`-${e.info.name}`);
        a.Italic(` - ${e.info.description}\n`);
      });
    if (!a._text) return ctx.reply("А доступных команд то и нет");
    ctx.reply(...a._Build());
  }
);

import("./cmds.js").then(() => {
  //  Общие команды группы
  let groupC = [],
    // Общие команды в лс
    privateC = [],
    // Админские в группах
    groupAC = [],
    xiller = [],
    allKmds = [];
  Object.keys(public_cmds).forEach((e) => {
    /**
     * @type {cmd}
     */
    const cmd = public_cmds[e],
      m = { command: cmd.info.name, description: cmd.info.description };
    if (
      (cmd.info.type == "group" || cmd.info.type == "all") &&
      cmd.info.perm == 0
    )
      groupC.push(m);
    if (
      (cmd.info.type == "group" || cmd.info.type == "all") &&
      cmd.info.perm == 1
    )
      groupAC.push(m);
    if (
      (cmd.info.type == "private" || cmd.info.type == "all") &&
      cmd.info.perm == 0
    )
      privateC.push(m), xiller.push(m);
    if (cmd.info.perm == 2) xiller.push(m);

    allKmds.push(e);
  });
  Object.keys(private_cmds).forEach((e) => allKmds.push(e));

  if (groupC[0])
    bot.telegram.setMyCommands(groupC, { scope: { type: "all_group_chats" } });
  if (groupAC[0])
    bot.telegram.setMyCommands(groupAC.concat(groupC), {
      scope: { type: "all_chat_administrators" },
    });
  if (privateC[0])
    bot.telegram.setMyCommands(privateC, {
      scope: { type: "all_private_chats" },
    });
  if (xiller[0])
    bot.telegram.setMyCommands(xiller.concat(privateC), {
      scope: { type: "chat", chat_id: members.xiller },
    });
  if (data.isDev)
    console.log(
      `> Command Кол-во команд: ${allKmds.length}${
        allKmds[0] ? `, список: ${allKmds.join(", ")}` : ""
      }`
    );
});
