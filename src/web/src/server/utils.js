// We need to load env before db because it depends on it
// Also botApiLink are used to link api from bot
import dotenv from "dotenv";
import fs from "fs";
import serveonet from "serveonet";

export class Logger {
	constructor({ filePath = "logs/log.txt", prefix = "" }) {
		this.stream = fs.createWriteStream(filePath, "utf-8");
		this.prefix = prefix;
	}
	/**
	 * @param {{
	 * consoleMessage?: string,
	 * fileMessage?: string,
	 * color: keyof typeof Logger.colors
	 * }} message
	 */
	log({ consoleMessage, fileMessage, color = "yellow" }) {
		const timestamp = `${this.prefix}[${new Date().toLocaleString([], {
			hourCycle: "h24",
		})}] `;

		if (consoleMessage)
			console.log(
				Logger.colors[color] + timestamp + "\x1b[0m" + consoleMessage
			);
		if (fileMessage) this.stream.write(timestamp + fileMessage + "\r");
	}

	/**
	 * @param {string} arg
	 * @param {string} context
	 */
	error(arg, context = "") {
		this.log({
			color: "red",
			consoleMessage: arg,
			fileMessage: arg + " " + context,
		});
	}

	/**
	 *
	 * @param {string} arg
	 */
	info(arg) {
		this.log({ color: "cyan", fileMessage: arg, consoleMessage: arg });
	}

	/**
	 *
	 * @param {string} arg
	 */
	success(arg) {
		this.log({ color: "green", fileMessage: arg, consoleMessage: arg });
	}

	static colors = {
		black: "\x1b[30m",
		red: "\x1b[31m",
		green: "\x1b[32m",
		yellow: "\x1b[33m",
		blue: "\x1b[34m",
		magenta: "\x1b[35m",
		cyan: "\x1b[36m",
		white: "\x1b[37m",
		gray: "\x1b[90m",
	};
}

export const logger = new Logger({
	filePath: "../../logs/web.txt",
	prefix: Logger.colors.black + "[WEB]",
});

export function botApiEnv() {
	dotenv.config({ path: "../../.env" });
}

export async function botApiLink() {
	const { tables, database } = await import(
		// @ts-ignore
		"../../../lib/launch/db.js"
	);

	// @ts-ignore
	const { util } = await import("../../../lib/Class/Utils.js");

	// @ts-ignore
	const { SubDB } = await import("../../../modules/Subscribe/db.js");

	await database.connect();
	Object.assign(globalThis, {
		tables,
		database,
		util,
		SubDB,
	});
	logger.success("[api] Bot api linked successfully!");
}

export function botHostExpose() {
	// ssh -R koboldie:80:localhost:8888 serveo.net  -o ServerAliveInterval=15
	serveonet({
		localHost: "localhost",
		localPort: 8888,
		remoteSubdomain: "koboldie",
		remotePort: 80,
		serverAliveInterval: 60,
		serverAliveCountMax: 3,
	})
		.on("error", (err) => {
			console.log(err.message);
		})
		.on("timeout", (connection) => {
			console.log("Connection to " + connection.host + " timed out.");
		})
		.on("connect", (connection) => {
			console.log("Tunnel established on port " + connection.localPort);
			console.log("pid: " + connection.pid);
		});
}

export function isBrowserSupported(nAgt = "") {
	/** @type {keyof typeof browsers} */
	var browserName = "Chrome";
	var fullVersion = "0";
	var majorVersion = 0;
	var verOffset, ix;

	// In old Edge, the true version is after "Edge"
	if ((verOffset = nAgt.indexOf("Edge")) != -1) {
		browserName = "Edge";
		fullVersion = nAgt.substring(verOffset + 5);
	}
	// In new Edge, the true version is after "Edg"
	else if ((verOffset = nAgt.indexOf("Edg")) != -1) {
		browserName = "Edge";
		fullVersion = nAgt.substring(verOffset + 4);
	}
	// In Chrome, the true version is after "Chrome"
	else if ((verOffset = nAgt.indexOf("Chrome")) != -1) {
		browserName = "Chrome";
		fullVersion = nAgt.substring(verOffset + 7);
	}
	// In Safari, the true version is after "Safari" or after "Version"
	else if ((verOffset = nAgt.indexOf("Safari")) != -1) {
		browserName = "Safari";
		fullVersion = nAgt.substring(verOffset + 7);
		if ((verOffset = nAgt.indexOf("Version")) != -1)
			fullVersion = nAgt.substring(verOffset + 8);
	}
	// In Firefox, the true version is after "Firefox"
	else if ((verOffset = nAgt.indexOf("Firefox")) != -1) {
		browserName = "Firefox";
		fullVersion = nAgt.substring(verOffset + 8);
	}

	// trim the fullVersion string at semicolon/space if present
	if ((ix = fullVersion.indexOf(";")) != -1)
		fullVersion = fullVersion.substring(0, ix);
	if ((ix = fullVersion.indexOf(" ")) != -1)
		fullVersion = fullVersion.substring(0, ix);

	majorVersion = parseInt("" + fullVersion, 10);
	if (isNaN(majorVersion)) {
		majorVersion = 0;
	}

	console.log(
		"\n" +
			"Browser name  = " +
			browserName +
			"\n" +
			"Full version  = " +
			fullVersion +
			"\n" +
			"Major version = " +
			majorVersion +
			"\n" +
			nAgt
	);

	const minVer = browsers[browserName];

	// If browser is unknown its maybe parse error
	return minVer ? majorVersion >= minVer : true;
}

const browsers = {
	Chrome: 87,
	Firefox: 78,
	Safari: 14,
	Edge: 88,
};
