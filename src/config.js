export default {
	// Keep it one line for autoreplace from leafs/commit.js
	version: [9, 0, 4],

	command: {
		clearCommand: /^(?:.\S*)(?:@?\S)\s?/g,
		parseArgs: /"[^"]+"|[^\s]+/g,
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

	modules: [
		"AdvancedData",
		"Command",
		"OC",
		"ManageDB",
		"Subscribe",
		"Timers",
		"MultiPublish",
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
