export default {
	// Keep it one line for autoreplace from leafs/commit.js
	version: [9, 13, 25],

	command: {
		/**
		 * Returns: [0] - full command, [1] - command prefix, [2] - command name
		 */
		get: /^(.)(?:(\w+)@?\w*)?\s?/,
		/**
		 * Use this with replace() to clear any command from message
		 */
		clear: /^\S*(?:@\S)?\s?/,
	},

	update: {
		/**
		 * 0 to disable
		 * @type {milliseconds}
		 */
		logTime: Infinity,

		/**
		 * Cooldown between requests to another active versions
		 * @type {milliseconds}
		 */
		timerTime: 5000,

		/**
		 * Relaunch polling interval for avoiding hang up's
		 * @type {milliseconds}
		 */
		pollingRelaunchInterval: 1000 * 60 * 60,
	},

	/**
	 * Cooldown of logging no connection errors
	 * @type {seconds}
	 */
	NoConnectionLogCooldown: 10,
	/**
	 * Cooldown beetween tries to reconnect after network error
	 * @type {seconds}
	 */
	ReconnectTimerWaitTime: 3,

	/**
	 * Time to wait until abort request to another bot instances
	 * @type {milliseconds}
	 */
	MessageTimeout: 2000,

	middlewares: [
		/**
		 * This middleware will protect all listeners from another bots.
		 */
		"BotGuard",
		/**
		 * Downloading user/group data from db and cancels
		 * parsing update if user is not logged.
		 */
		"DataGuard",
		/**
		 * Handles error for all next listeners and sends message about
		 * error to log cvhat and chat where error happened. Because of
		 * previous middlewares is guards from not registered users
		 * and groups, it cannot send messages before they will run.
		 */
		"ErrorHandler",
		/**
		 * Cancels next listeners and deletes message if user entered
		 * nonotify mode
		 */
		"NoNotify",
		/**
		 * Parsing ctx.data.user.scene and ctx.data.sceneCache
		 * to ctx.scene object.
		 */
		"Scene",
	],

	modules: [
		"Command",
		"BatteryNotifier",
		"Subscribe",
		"Animation",
		"Web",
		"Discord",
	],
};
