import { Context } from "telegraf";
import { Xitext } from "./XitextCLS.js";
import { isAdmin } from "../functions/checkFNC.js";
import { bot, members } from "../setup/tg.js";
import { data } from "../start-stop.js";
import { d, format } from "./formatterCLS.js";
import { database } from "../../index.js";
import { Session, ssn } from "./sessionCLS.js";
import { EventListener } from "./EventsCLS.js";

const public_cmds = {},
  private_cmds = {},
  hprefixes = [".", "-", "$"];
/**
 * @typedef {Object} CommandType
 * @property {String} group
 * @property {String} private
 * @property {String} all
 */

export class cmd {
  /**
   * Создает команду
   * @param {Object} info
   * @param {String} info.name Имя
   * @param {Boolean} info.hide Спрятать ли из листа команд
   * @param {Boolean} info.specprefix
   * @param {String} info.description Описание
   * @param {String} info.session В формате d.session
   * @param {Number} info.permisson 0 - все, 1 - админы
   * @param {CommandType} info.type all | group | private
   * @param {function(Context, Array, import("./EventsCLS.js").EventData)} callback
   */
  constructor(info, callback) {
    if (!info.name) return;

    // Регистрация инфы
    this.info = {
      name: info.name,
      description: info.description ?? "Пусто",
      type: info.type,
      perm: info.permisson ?? 0,
      hide: info.hide,
      session: info.session,
    };
    this.callback = callback;

    // Ы
    if (!info.specprefix) {
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
  static async cantUse(command, ctx, user = null) {
    // Условия разрешений
    let _lg = // Где
        command.info.type === "group" &&
        (ctx.chat.type === "group" || ctx.chat.type === "supergroup"),
      _lp = command.info.type === "private" && ctx.chat.type === "private",
      _lc = command.info.type === "channel" && ctx.chat.type === "channel",
      _la = command.info.type === "all" || !command.info.type,
      // Если команда для всех
      _pall = command.info.perm === 0,
      // Если команда для админов, и отправитель админ
      _padmin =
        command.info.perm === 1 &&
        (await isAdmin(ctx, ctx.message.from.id, user)),
      // Если команда хильки
      _pxiller =
        command.info.perm === 2 && ctx.message.from.id == members.xiller;

    // Если нет ни одного разрешения, значит нельзя
    return !((_la || _lc || _lg || _lp) && (_pall || _padmin || _pxiller));
  }
}

/**======================ss
 *    Приветствие
 *========================**/
new cmd(
  {
    name: "start",
    description: "Начало работы с ботом в лс",
    type: "private",
    hide: true,
  },
  (ctx) => {
    ctx.reply(
      `${format.getName(
        ctx
      )} Кобольдя очнулся. Список доступных Вам команд: /help`
    );
  }
);
/*========================*/

new cmd(
  {
    name: "help",
    description: "Список команд",
    type: "all",
  },
  async (ctx, _a, data) => {
    if (!Object.keys(public_cmds)[0] && !Object.keys(private_cmds)[0])
      return ctx.reply("А команд то и нет");
    let c = false,
      p = false,
      a = new Xitext();

    for (const e of Object.values(public_cmds)) {
      if (await cmd.cantUse(e, ctx, data.userRights)) continue;
      if (!c) a.Text(`Доступные везде команды:\n`), (c = true);
      a.Text(`  /${e.info.name}`);
      a.Italic(` - ${e.info.description}\n`);
    }

    for (const e of Object.values(private_cmds)) {
      if (await cmd.cantUse(e, ctx, data.userRights)) continue;
      if (!p) a.Text(`\nДоступные вам в этом чате команды:\n`), (p = true);
      a.Text(`  `);
      a.Mono(`-${e.info.name}`);
      a.Italic(` - ${e.info.description}\n`);
    }
    if (!a._text) return ctx.reply("А доступных команд то и нет");
    ctx.reply(...a._Build());
  }
);

new cmd(
  {
    name: "cancel",
    prefix: "def",
    description: "Выход из пошагового меню",
    permisson: 0,
    hide: true,
    type: "private",
  },
  async (ctx) => {
    /**
     * @type {import("../models.js").DBUser}
     */
    const user = await database.get(d.user(ctx.from.id), true);
    if (user?.cache?.session) {
      await ctx.reply(`Вы вышли из меню ${user.cache.session}`);
      delete user.cache.session;
      await database.set(d.user(ctx.from.id), user, true);
    } else ctx.reply("Вы не находитесь в меню!");
  }
);

new cmd(
  {
    name: "next",
    prefix: "def",
    description: "Переходит на следующий шаг меню",
    permisson: 0,
    hide: true,
    type: "private",
  },
  async (ctx, _a, data) => {
    /**
     * @type {import("../models.js").DBUser}
     */
    const user = data.DBUser ?? (await database.get(d.user(ctx.from.id), true));
    if (user?.cache?.session?.split) {
      /**
       * @type {Session}
       */
      const abst = user.cache.session.split("::"),
        sess = ssn[abst[0]];
      if (sess) {
        if (sess.executers[abst[1]]) {
          sess.executers[abst[1]](ctx, user);
        } else ctx.reply("Этот шаг не предусматривает пропуска!");
      } else delete user.cache.session;
      await database.set(d.user(ctx.from.id), user, true);
    } else ctx.reply("Вы не находитесь в меню!");
  }
);

export function loadCMDS() {
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
    if (!cmd.info.hide) {
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
    }

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

  new EventListener(
    "text",
    9,
    async (ctx, next, data) => {
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
      }
      if (await cmd.cantUse(command, ctx, data.userRights))
        return ctx.reply(
          "У вас нет разрешений для использования этой команды. Список доступных команд: /help"
        );

      try {
        const a = t
          .match(/"[^"]+"|[^\s]+/g)
          .map((e) => e.replace(/"(.+)"/, "$1").toString());
        a.shift();
        try {
          const ret = command.callback(ctx, a, data);
          if (ret?.catch)
            ret.catch((e) => {
              console.warn(
                `PERR! ${
                  format.getName(ctx.message.from) ?? ctx.message.from.id
                }: ${t}. ${e}`
              );
            });
        } catch (error) {
          console.warn(
            `ERR! ${
              format.getName(ctx.message.from) ?? ctx.message.from.id
            }: ${t}. ${error}`
          );
        }

        console.log(
          `> CMD. ${
            format.getName(ctx.message.from) ?? ctx.message.from.id
          }: ${t}`
        );
      } catch (e) {}
    },
    true
  );
}
