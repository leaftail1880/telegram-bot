import chalk from "chalk";
import fs from "fs/promises";
import config from "../config.js";
import styles from "./styles.js";

import { bot, database } from "../index.js";

import "./query.js";
import "./сommand.js";

import { bold, fmt, link } from "telegraf/format";
import { Cooldown } from "./utils/cooldown.js";
import { util } from "./utils/index.js";

import { handleBotError, handleError } from "./launch/handlers.js";

import { parseError } from "./utils/error.js";
import { importMultiple } from "./utils/import.js";

export const Service = {
	v: config.version.join("."),
	sv: `v${config.version.join(".")}`,

	startTime: Date.now(),

	launched: false,
	stopped: false,

	development: process.env.dev == "true",
	private: true,

	chat: {
		owner: Number(process.env.ownerID),
		log: Number(process.env.logID),
	},

	/** @type {Record<number, 'accepted' | 'waiting'>} */
	joins: {},
	/** @type {Record<string, any>} */
	errors: {},
	/** @type {NodeJS.Timeout | number} */
	pollingTimer: null,

	async start() {
		/**
		 * @param {string} m
		 */
		function print(m) {
			console.log(styles.state(`${c}/8`, m));
			c++;
		}
		let c = 0;

		print(
			`${Service.development ? chalk.yellow("DEV ") : ""}v${config.version.join(
				"."
			)}`
		);

		if (Service.development)
			try {
				await fs.mkdir("logs");
			} catch {}

		/**
		 * Connecting to main tables:
		 * db.json, users.json and groups.json
		 */
		print("Connecting to database...");
		await database.connect();

		bot.catch(Service.handlers.bot);
		bot.telegram.sendMessage(
			Service.chat.log,
			fmt`⌬ Кобольдя ${link(bold(Service.sv), "https://t.me/")} запущен`
		);

		/**
		 * Middlewares
		 */
		print("Loading middlewares...");
		await importMultiple(config.middlewares, (s) =>
			import(`../middlewares/${s}/index.js`)
		);

		/**
		 * Modules
		 */
		print("Loading modules...");
		await importMultiple(config.modules, (s) =>
			import(`../modules/${s}/index.js`)
		);

		/**
		 * Connecting to module tables if they exists
		 */
		print("Connecting to modules databases...");
		await database.connect();

		/**
		 * Command and lists initalization
		 */
		print("Emitting load.modules...");
		await new Promise((resolve) => {
			// Wait till all events are executed
			process.once("modulesLoad", resolve).emit("modulesLoad");
		});

		/**
		 * Bot launch
		 */
		print("Launching bot...");
		bot.botInfo = await bot.telegram.getMe();
		this.startPollingWithRestart();

		print(
			`Ready to work in ${styles.highlight(
				((Date.now() - Service.startTime) / 1000).toFixed(2)
			)}s`
		);
		process.emit("loaded");
	},
	/**
	 * @param {string} reason
	 * @param {"ALL" | "BOT" | "none"} mode
	 * @param {boolean} sendMessage
	 */
	async stop(reason = "Остановка", mode = "none", sendMessage = true) {
		let message = fmt`${link(bold`✕`, "https://t.me")}  ${mode}. ${reason} ${
			Service.sv
		} ${bold(process.env.whereImRunning)}`;

		// Skip on dev terminal stop
		const send = !(
			Service.development && ["SIGINT", "SIGTERM"].includes(reason)
		);
		if (send) {
			console.log(styles.error(message.text));

			if (Service.launched && sendMessage)
				await bot.telegram.sendMessage(Service.chat.log, message);
		}

		if (mode !== "none" && Service.launched && !Service.stopped) {
			Service.stopped = true;
			bot.stop(reason);
		}

		if (mode === "ALL") {
			if (!database.closed && this.launched) {
				console.log(styles.state("Bot", "Saving db..."));

				await database.commitAll();
				console.log(styles.state("Bot", "Done."));
			}
			process.exit(0);
		}
	},
	/**
	 *
	 * @param {RealError} error
	 */
	async error(error) {
		if (ERROR_TIMER.isExpired())
			try {
				if (!error.stack) error.stack = Error().stack;
				const { type, message, stringStack, stringColoredStack, extra } =
					parseError(error);

				console.warn(" ");
				console.warn(chalk.red(type).trim() + chalk.white(message));
				console.warn(stringColoredStack);
				console.warn(" ");

				if (!Service.launched || Service.stopped) return;

				const text = fmt`${link(type, "https://t.me/")}${bold(
					message
				)}\n${stringStack}`;

				await bot.telegram.sendMessage(Service.chat.log, text, {
					disable_web_page_preview: true,
				});

				if (extra) {
					await util.sendSeparatedMessage(extra, (a) =>
						bot.telegram.sendMessage(Service.chat.log, a, {
							disable_web_page_preview: true,
						})
					);
				}
			} catch (e) {
				console.warn(new Error(e.message, { cause: error }));
			}
	},
	startPollingWithRestart() {
		Service.launched = true;
		Service.stopped = false;
		bot.launch({ dropPendingUpdates: false });
		Service.pollingTimer = setInterval(async () => {
			if (Service.stopped) return clearInterval(Service.pollingTimer);
			bot.stop("Relaunch");

			// Use 1s timeout to prevent from errors about "Terminated by other getUpdates request"
			setTimeout(() => {
				bot.launch();
			}, 2000);
		}, config.update.pollingRelaunchInterval);
	},
	stopPolling() {
		clearInterval(Service.pollingTimer);
		Service.stopped = true;
		bot.stop();
	},
	handlers: {
		processError: handleError,
		bot: handleBotError,
	},
};

const ERROR_TIMER = new Cooldown(5);
