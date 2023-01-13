import { Context } from "telegraf";
import { ssn } from "../Class/Scene.js";
import { Xitext } from "../Class/Xitext.js";
import { Service } from "../Service.js";

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
		log: `No scene cache`,
	},
	421: {
		user: `Потеряны значения предыдущих шагов при редактировании. Попробуй снова отредактировать персонажа.`,
		log: `No scene cache`,
	},
};

/**
 * @param {number} code
 * @param {Context & {message?: {text?: string; caption?: string}}} ctx
 */
export function err(code, ctx) {
	ssn.OC.exit(ctx.from.id);
	const ErrText = ERRCODES[code].user ?? ERRCODES[800].user;
	if (ctx)
		ctx.reply(...new Xitext()._.group(`Ошибка ${code}`).bold().mono()._.group().text(" ").text(ErrText)._.build());
	Service.error({ name: "SceneError", message: `${code} ${ErrText}` });
	`ERR ${code} ${ErrText}\nUser: ${ctx.from.username ?? ctx.from.id}, Text: ${ctx.message.text || ctx.message.caption}`;
}
