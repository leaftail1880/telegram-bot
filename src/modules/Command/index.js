export const cooldown = 5 * 3.6e6;

const public_commands = [
	"abc",
	"call",
	"google",
	"name",
	"pin",
	"admins",
	"upload",
	"nonotify", //
];

for (const cmd of public_commands) import(`./public/${cmd}.js`);

const private_commands = [
	"stop",
	"sudo",
	"v",
	"ping",
	"repl", //
];

for (const cmd of private_commands) import(`./private/${cmd}.js`);
