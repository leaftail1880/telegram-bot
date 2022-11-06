export default {
  version: [
    8, //
    1, //
    5, //
  ],

  command: {
    clearCommand: /^.\w*\s?/g,
    parseArgs: /"[^"]+"|[^\s]+/g,
  },

  // Время в миллисекундах, которое должно пройти что бы данные пользователя обновились.
  // Чем меньше, тем дольше будет обработка сообщений при запуске.
  cache: { updateTime: 2000 },

  modules: [
    "UpdateUser", // Обновление пользователей и групп в базах данных
    "Command", // Команды
    "OC", // Модуль для команды /oc
    "DBmanageV2",
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
