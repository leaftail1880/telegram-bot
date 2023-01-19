export default {
	// Keep it one line for autoreplace from leafs/commit.js
	version: [9, 1, 9],

	command: {
		/**
		 * Returns: [0] - full command, [1] - command prefix, [2] - command name
		 */
		get: /^(.)(?:(\w+)@?\w*)?\s?/,
		/**
		 * Use this with replace() to clear any command from message
		 */
		clear: /^\S*(?:@\S)?\s?/,
		/**
		 * Use it to parse command args
		 * @deprecated No one use args with tg bots
		 */
		parseArgs: /"[^"]+"|\S+/g,
	},

	update: {
		/**
		 * Время во время которого в лог будет выводиться скорость обработки запроса. 0 что бы отключить
		 * @type {milliseconds}
		 */
		logTime: Infinity,

		/**
		 * Задержка между запросами к другим активным версиям
		 * @type {milliseconds}
		 */
		timerTime: 5000,

		/**
		 * Интервал перезапуска длинного поллинга воизбежание зависаний кеша
		 * @type {milliseconds}
		 */
		pollingRelaunchInterval: 1000 * 60 * 60,
	},

	/**
	 * Кулдаун для ошибок в чате
	 * @type {seconds}
	 */
	ErrorCooldown: 10,
	/**
	 * Время в секундах, через которое бот попытается восстановить подключение после сетевой ошибки
	 * @type {seconds}
	 */
	ReconnectTimerWaitTime: 1,

	middlewares: [
		/**
		 * Downloading user/group data from db and cancels
		 * parsing update if user is not logged
		 */
		"DataGuard",
		/**
		 * Parsing ctx.data.user.scene and ctx.data.sceneCache
		 * to ctx.scene object
		 */
		"Stage",
	],

	modules: [
		"Command",
		"OC",
		"ManageDB",
		"Timers",
		"MultiPublish",
		// "Subscribe",
		// "Updates",
		// "Migrate",
		// "Animation"
	],

	dbkey: {
		session: "bot_session",
		version: "bot_latest_version",
		request: "bot_request",
	},
};
