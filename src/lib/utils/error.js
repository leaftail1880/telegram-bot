import chalk from "chalk";
import util from "util";

/**
 * @type {[RegExp | string, string?][]}
 */
const FITLERS = [
	[/^\s+at\s/],
	[/\\/g, "/"],
	[/<anonymous>/g, chalk.blackBright("</>")],
	[
		/.+src\/web\/node_modules\/(.*)/,
		chalk.blackBright("src/web/node_modules/$1"),
	],
	[/.+src\/web\/src\/(.*)/, chalk.blackBright("src/web/src/$1")],
	[/.+node_modules\/(.*)/, chalk.blackBright("node_modules/$1")],
	[/.+src\/(.*)/, chalk.blackBright("src/$1")],
	[/.*Telegram\.callApi.*/, "Telegram.callApi()"],
	[/.*node:.*/],
];

/**
 * @param {string} line
 */
function parseStackLine(line) {
	for (const [regexp, replacer] of FITLERS) {
		if (typeof line !== "string" || !line) break;
		line = line.replace(regexp, replacer ?? "");
	}
	return line;
}

/**
 * @param {RealError} err
 */
export function parseError(err) {
	let message = err.message;
	if (typeof message !== "string") message = util.inspect(message);
	let stack = err.stack.replace(message, "").split("\n");
	let type = err.name;
	if (!stack[0].match(/^\s+at\s/)) type = stack.shift();

	if (message.match(/\d{3}:\s/g)) {
		type = `${type.replace(": ", "")} ${message.split(": ")[0]}: `;
		message = message.split(": ").slice(1).join(": ");
	}

	const parsedStack = stack
		.map(parseStackLine)
		.filter((e) => e)
		.map((e) => ` ${e}\n`);

	const stringColoredStack = [...new Set(parsedStack).values()].join("");
	const stringStack = stringColoredStack.replace(/\x1b\[\d+m/g, "");
	const extra = err.on && util.inspect(err.on);

	return { type, message, stringStack, stringColoredStack, extra };
}
