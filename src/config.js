export default {
	version: [8, 1, 23],

	command: {
		clearCommand: /^.\w*\s?/g,
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

		/**
		 * Время которое должно пройти что бы данные пользователя обновились.
		 * Чем меньше, тем дольше будет обработка сообщений при запуске.
		 * @type {milliseconds}
		 */
		cacheTime: 10000,
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
