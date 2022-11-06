export const util = {
  /**
   * @param {any} target
   * @returns {string}
   */
  toStr(target, space = "  ", cw = "", funcCode = false, depth = 0) {
    if (depth > 10 || typeof target !== "object")
      return `${rep(target)}` ?? `${target}` ?? "{}";

    function rep(value) {
      switch (typeof value) {
        case "function":
          // const reg = /(.*\(.+\)\s*=?>?\s*\{).+\}/g;
          /**
           * @type {String}
           */
          let r = //reg.test(value) ?
            value.toString().replace(/[\n\r]/g, "");
          // : "function() { }";

          if (!funcCode) {
            const native = r.endsWith("[native code] }");
            const code = native ? " [native code] " : "...";
            let isArrow = true,
              name = "<>";

            if (r.startsWith("function")) {
              r = r.replace(/^function\s*/, "");
              isArrow = false;
            }

            if (/\w*\(/.test(r)) {
              name = r.match(/(\w*)\(/)[1];
              r = r.replace(name, "");
            }

            let count = 0,
              bracket = false,
              escape = false;

            for (const [i, char] of r.split("").entries()) {
              if (char === '"' && !escape) {
                bracket = !bracket;
              }

              if (char === "\\") {
                escape = true;
              } else escape = false;

              if (!bracket && char === ")") {
                count = i;
                break;
              }
            }
            r = `${isArrow ? "" : "function "}${name}${r.substring(0, count)})${
              isArrow ? " => " : " "
            }{${code}}`;
          }

          value = r;

          break;

        case "object":
          if (visited.has(value)) {
            // Circular structure detected
            value = "{...}";
            break;
          }

          try {
            visited.add(value);
          } catch (e) {}

          const allInherits = {};

          for (const key in value)
            try {
              // value[key] can be ungettable
              allInherits[key] = value[key];
            } catch (e) {}

          value = allInherits;
          break;
      }
      return value;
    }

    // avoid Circular structure error
    const visited = new WeakSet();

    return JSON.stringify(target, (_, value) => rep(value), space)?.replace(
      /"/g,
      cw
    );
  },

  /**
   * Convert Durations to milliseconds
   */
  toMS(value) {
    const number = Number(value.replace(/[^-.0-9]+/g, ""));
    value = value.replace(/\s+/g, "");
    if (/\d+(?=y)/i.test(value)) return number * 3.154e10;
    else if (/\d+(?=w)/i.test(value)) return number * 6.048e8;
    else if (/\d+(?=d)/i.test(value)) return number * 8.64e7;
    else if (/\d+(?=h)/i.test(value)) return number * 3.6e6;
    else if (/\d+(?=m)/i.test(value)) return number * 60000;
    else if (/\d+(?=s)/i.test(value)) return number * 1000;
    else if (/\d+(?=ms|milliseconds?)/i.test(value)) return number;
  },
  /**
   *
   * @param {number | string} hours
   * @param {string} left1 остался
   * @param {string} left2 осталось
   * @param {string} left3 осталось
   * @returns {string}
   */
  toHrsString(hours, left1, left2, left3) {
    const hrs = `${hours}`;
    let o;
    if (hrs.endsWith("1") && hrs != "11") {
      o = `час${left1 ? ` ${left1}` : ""}`;
    } else if (hrs.endsWith("2") || hrs.endsWith("3") || hrs.endsWith("4")) {
      o = `часa${left2 ? ` ${left2}` : ""}`;
    } else {
      o = `часов${left3 ? ` ${left3}` : ""}`;
    }
    return `${hrs} ${o}`;
  },
  /**
   *
   * @param {number | string} seconds
   * @param {string} left1 осталось
   * @param {string} left2 осталась
   * @param {string} left3 осталось
   * @returns {string}
   */
  toSecString(seconds, left1, left2, left3) {
    let s = `секунд${left1 ? ` ${left1}` : ""}`,
      sec = `${seconds}`;
    if (sec.endsWith("1") && sec != "11") {
      s = `секунда${left2 ? ` ${left2}` : ""}`;
    } else if (sec.endsWith("2") || sec.endsWith("3") || sec.endsWith("4")) {
      s = `секунды${left3 ? ` ${left3}` : ""}`;
    }
    return `${sec} ${s}`;
  },
  /**
   *
   * @param {number | string} minutes
   * @param {string} left1 осталось
   * @param {string} left2 осталась
   * @param {string} left3 осталось
   * @returns {string}
   */
  toMinString(minutes, left1, left2, left3) {
    let m = `минут${left1 ? ` ${left1}` : ""}`,
      min = `${minutes}`;
    if (min.endsWith("1") && min != "11") {
      m = `минута${left2 ? ` ${left2}` : ""}`;
    } else if (min.endsWith("2") || min.endsWith("3") || min.endsWith("4")) {
      m = `минуты${left3 ? ` ${left3}` : ""}`;
    }
    return `${min} ${m}`;
  },
  add(array, value) {
    const a = Array.isArray(array) ? array : [],
      es = [];
    if (!a.includes(value)) a.push(value);
    a.forEach((e) => {
      if (!es.includes(e)) es.push(e);
    });
    return es;
  },

  isError(error) {
    return typeof error === "object" && error !== null && "message" in error;
  },
  /**
   *
   * @param {{name?: string; stack?: string; message: string; on?: object;}} err
   * @param {boolean} [returnArr]
   * @returns
   */
  errParse(err, returnArr) {
    if (typeof err != "object" || !err.stack || !err.message) return err;

    let message = err.message,
      stack = err.stack.replace(err.message, "").split("\n"),
      type = err.name ?? stack[0].match(/\s+at\s/g) ? stack.shift() : "Error";

    if (message.match(/\d{3}:\s/g)) {
      type = `${type.replace(": ", "")} ${message.split(": ")[0]}: `;
      message = message.split(": ").slice(1).join(": ");
    }

    const stringStack = [
      ...new Set(
        stack
          .map((e) => e.replace(/\s+at\s/g, ""))
          .map(lowlevelStackParse)
          .filter((e) => e)
          .map((e) => `\n ${e}`)
      ).values(),
    ].join("");

    return returnArr
      ? [
          type,
          message,
          stringStack,
          err.on ? util.toStr(err.on, " ") : undefined,
        ]
      : `${type.includes(":") ? type : `${type}: `}${message}${stringStack}`;
  },
  /**
   *
   * @param {import("telegraf/types").User} user
   * @returns
   */
  getName(user) {
    let res = String(user?.first_name ?? user?.username ?? user?.id ?? "WTF");

    if (user?.last_name && res.length + user.last_name.length < 10)
      res += user.last_name;

    return res;
  },
  /**
   *
   * @param {DB.User} dbuser
   * @param {import("telegraf/types").User} user
   */
  getFullName(dbuser, user) {
    return dbuser?.cache?.nickname ?? this.getName(user);
  },
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },
  /**
   *
   * @param {string} msg
   * @param {Function} method
   */
  async sendSeparatedMessage(msg, method, limit = 4000, safeCount = 5) {
    if (msg.length < limit) return method(msg);

    for (let p = 1; p <= Math.ceil(msg.length / limit) && p <= safeCount; p++) {
      await method(msg.substring(p * limit - limit, p * limit));
    }
  },
};

const replaces = [
  [/\\/g, "/"],
  ["<anonymous>", "</>", 0],
  [/file:.*src\/(.*)/, "src/$1"],
  [/.*Telegram\.callApi.*/, "Telegram.callApi()"],
  [/.*redis.*/, "Redis"],
  [/.*node.*/],
];

function lowlevelStackParse(el) {
  let e = el;
  for (const [r, p, count] of replaces) {
    if (typeof e === "string")
      e =
        count === 0 && typeof e.replaceAll === "function"
          ? // @ts-ignore
            e.replaceAll(r, p ?? "")
          : // @ts-ignore
            e.replace(r, p ?? "");
  }
  return e;
}

export const d = {
  user: (id) => `User::${id}`,
  pn: (prefix, name) => `${prefix}::${name}`,
  group: (id) => `Group::${id}`,
  session: (name, stage) => `${name}::${stage}`,
  // Query link
  query: (prefix, name, ...args) =>
    `${prefix}${d.separator.link}${name}${
      args ? `${d.separator.linkToData}${args.join(d.separator.data)}` : ""
    }`,
  queryREGISTER: (prefix, name) => `${prefix}${d.separator.link}${name}`,
  // Separator
  separator: {
    link: ".",
    linkToData: "/",
    data: "&",
  },
  guide: (index) => `https://t.me/xillerbotguides/${index}`,
  userLink: (nickname) => `https://t.me/${nickname}`,
};
