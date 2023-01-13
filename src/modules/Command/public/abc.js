import { Command } from "../../../lib/Class/Command.js";

const obj = {
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
		if (obj[a]) l = obj[a];
		else if (obj[a.toLowerCase()]) l = obj[a.toLowerCase()].toUpperCase();
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
		if (!("reply_to_message" in ctx.message))
			return ctx.reply("Отметь сообщение!", {
				reply_to_message_id: ctx.message.message_id,
				allow_sending_without_reply: true,
			});

		/** @type {{text?: string; caption?: string; message_id: number}} */
		const msg = ctx.message.reply_to_message;

		if (!msg.text && !msg.caption) return ctx.reply("Я не могу это перевести!");

		ctx.reply(abc(msg.text ?? msg.caption), {
			reply_to_message_id: msg.message_id,
			allow_sending_without_reply: true,
		});
	}
);
