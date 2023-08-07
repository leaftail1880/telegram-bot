import { util } from "./index.js";

/**
 * @type {[RegExp | string, string?, number?][]}
 */
const FITLERS = [
	[/\\/g, "/"],
	["<anonymous>", "</>", 0],
	[/file:.*src\/(.*)/, "src/$1"],
	[/file:.*node_modules\/(.*)/, "node_modules/$1"],
	[/.*Telegram\.callApi.*/, "Telegram.callApi()"],
	[/.*node:.*/],
];

/**
 * @param {string} line
 */
function parseStackLine(line) {
	for (const [regexp, replacer, count] of FITLERS) {
		if (typeof line !== "string") continue;
		const replaceAll = count === 0;

		if (replaceAll)
			line = line.replace(new RegExp(regexp, "g"), replacer ?? "");
		else line = line.replace(regexp, replacer ?? "");
	}
	return line;
}

/**
 * @param {{name?: string; stack?: string; message: string; on?: object;}} err
 * @returns {[string, string, string, string]}
 */
export function parseError(err) {
	let message = err.message;
	if (typeof message !== "string")
		message = "NOT_A_STRING_MESSAGE: " + JSON.stringify(message);
	let stack = err.stack.replace(err.message, "").split("\n");
	let type = err.name;
	if (!stack[0].match(/^\s+at\s/)) type = stack.shift();

	if (message.match(/\d{3}:\s/g)) {
		type = `${type.replace(": ", "")} ${message.split(": ")[0]}: `;
		message = message.split(": ").slice(1).join(": ");
	}

	const stringStack = [
		...new Set(
			stack
				.map((e) => e.replace(/^\s+at\s/, ""))
				.map(parseStackLine)
				.filter((e) => e)
				.map((e) => ` ${e}\n`)
		).values(),
	].join("");

	const extra = err.on ? util.inspect(err.on) : undefined;

	return [type, message, stringStack, extra];
}
