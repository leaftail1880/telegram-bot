export default {
	version: [
		8, //
		1, //
		10, //
	],

	command: {
		clearCommand: /^.\w*\s?/g,
		parseArgs: /"[^"]+"|[^\s]+/g,
	},

	update: {
		// Время в мс, во время которого в лог будет выводиться скорость обработки запроса. 0 что бы отключить
		logTime: 30000,
		// Задержка между запросами к другим активным версиям в мс
		timerTime: 5000,
	},

	// Время в миллисекундах, которое должно пройти что бы данные пользователя обновились.
	// Чем меньше, тем дольше будет обработка сообщений при запуске.
	cache: { updateTime: 2000 },

	modules: [
		"AdvancedData", // Обновление пользователей и групп в базах данных
		"Command", // Команды
		"OC", // Модуль для команды /oc
		"ManageDB",
		"Subscribe",
		"Timers", // Таймеры
		"Updates",
		// "Migrate",
		// "Animation"
	],

	dbkey: {
		session: "bot_session",
		version: "bot_latest_version",
		request: "bot_request",
	},
};
