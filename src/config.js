import { env } from "./app/setup/tg.js";

export const VERSION = [6, 4, 4],
  PORT = !env.xillerPC ? 3001 : new Date(Date.now()).getMilliseconds(),
  Plugins = ["Command", "timeChecker", "html"],
  dbkey = {
    session: "bot_session",
    version: "bot_latest_version",
  },
  MEMBERS = {
    // .
    dot: {
      msk: 2,
      start: ["00", "00"],
      end: ["05", "00"],
    },
    // Xiller
    xiller: {
      msk: 0,
      start: ["00", "00"],
      end: ["05", "00"],
      admin: true,
    },
    // Hloya
    hloya: {
      msk: 7,
      start: ["00", "00"],
      end: ["05", "00"],
    },
    default: {
      msk: 0,
      start: ["00", "00"],
      end: ["05", "00"],
    },
  };
