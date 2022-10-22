import { Context } from "telegraf";
import { ssn } from "../class/sessionCLS.js";
import { Xitext } from "../class/XitextCLS.js";

export const ERRCODES = {
  num: {
    user: "",
    log: "",
  },
  800: {
    user: "Хилька заруинил даже вывод ошибки, поэтому вы видите его защиту от самого себя ъвхъавх",
    log: "Дурачек",
  },
  420: {
    user: `Потеряны значения предыдущих шагов при создании. Попробуй снова создать персонажа.`,
    log: `No session cache`,
  },
  421: {
    user: `Потеряны значения предыдущих шагов при редактировании. Попробуй снова отредактировать персонажа.`,
    log: `No session cache`,
  },
};

/**
 * @param {number} code
 * @param {FullContext | Context} ctx
 */
export function err(code, ctx) {
  ssn.OC.exit(ctx.from.id);
  if (ctx)
    ctx.reply(
      ...new Xitext()
        ._Group(`Ошибка ${code}`)
        .Bold()
        .Mono()
        ._Group()
        .Text(" ")
        .Text(ERRCODES[code].user ?? ERRCODES[800].user)
        ._Build()
    );
  console.warn(
    `ERR ${code} ${ERRCODES[code].log ?? ERRCODES[800].log}${
      ctx.from
        // @ts-ignore
        ? `User: ${ctx.from.username ?? ctx.from.id}, Text: ${ctx.message.text || ctx.message.caption}`
        : ""
    }`
  );
}
