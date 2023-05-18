import { Command } from "../../../lib/Class/Command.js";
import { util } from "../../../lib/Class/Utils.js";
import { bold, fmt } from "../../../lib/Class/Xitext.js";

/**
 * @type {Record<string, string>}
 */
const DICT = {
	q: "й",
	w: "ц",
	e: "у",
	r: "к",
	t: "е",
	y: "н",
	u: "г",
	i: "ш",
	o: "щ",
	p: "з",
	"[": "х",
	"{": "Х",
	"]": "ъ",
	"}": "Ъ",
	a: "ф",
	s: "ы",
	d: "в",
	f: "а",
	g: "п",
	h: "р",
	j: "о",
	k: "л",
	l: "д",
	";": "ж",
	":": "Ж",
	"'": "э",
	'"': "Э",
	z: "я",
	x: "ч",
	c: "с",
	v: "м",
	b: "и",
	n: "т",
	m: "ь",
	",": "б",
	"<": "Б",
	".": "ю",
	">": "Ю",
};

/**
 *
 * @param {string} msg
 * @returns
 */
function abc(msg) {
	let ret = "";
	for (const a of msg.split("")) {
		let l = a;
		if (a in DICT) l = DICT[a];
		else if (DICT[a.toLowerCase()]) l = DICT[a.toLowerCase()].toUpperCase();
		ret = ret + l;
	}
	return ret;
}

new Command(
	{
		name: "abc",
		description: "Переводит",
		permission: "all",
		target: "all",
	},
	(ctx) => {
		const repl = util.makeReply(ctx, "direct");
		/** @type {{text?: string; caption?: string; message_id: number}} */
		const msg = ctx.message.reply_to_message;

		if (!msg) return repl(fmt`${bold("Ответь")} на сообщение, раскладку которого хочешь перевести`);

		if (!msg.text && !msg.caption) return repl("Я не могу это перевести!");

		repl(abc(msg.text ?? msg.caption), "reply");
	}
);
