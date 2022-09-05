import { env } from "./app/setup/tg.js";

export const VERSION = [6, 5, 22],
  PORT = !env.xillerPC ? 3001 : Number(Date.now().toString().substring(9)),
  Plugins = [
    "UserDB",
    "Command",
    "timeChecker",
    "html",
    "Groups",
    "OC",
    /*"Animation"*/
  ],
  dbkey = {
    session: "bot_session",
    version: "bot_latest_version",
    request: "bot_request",
  },
  MEMBERS = {
    // dot
    dot: {
      GMT: 2,
      start: ["02", "00"],
      end: ["05", "00"],
    },
    // Xiller
    xiller: {
      GMT: 2,
      start: ["00", "00"],
      end: ["05", "00"],
      admin: true,
    },
    // Hloya
    hloya: {
      GMT: 7,
      start: ["00", "00"],
      end: ["05", "00"],
    },
    default: {
      GMT: 0,
      start: ["00", "00"],
      end: ["05", "00"],
    },
  };
