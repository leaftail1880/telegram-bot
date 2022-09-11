import { Context } from "telegraf";

class formatter {
  stringifyEx(startObject, space = undefined) {
    if (typeof startObject === "string") return startObject;
    let unsafeProperty = "unsafeproperty.fixed";
    function getString(ThisObject, before, isSpace) {
      switch (typeof ThisObject) {
        case "function":
          return `function ${ThisObject.name ?? ""}(${ThisObject.length} args)`;
        case "object":
          if (ThisObject == null) {
            return "null";
          }
          if (!Object.entries(ThisObject).length) {
            return "{}";
          }
          if (!ThisObject[unsafeProperty]) {
            let isArray = Array.isArray(ThisObject);
            let ReturnString = isArray ? "[" : "{";
            let First = false;
            let nextS = before + "" + (space ?? "");
            ThisObject[unsafeProperty] = true;
            for (const key in ThisObject) {
              if (key == unsafeProperty) {
                continue;
              }
              try {
                ReturnString +=
                  (First ? "," : "") +
                  "" +
                  (isSpace ? "\n" : "") +
                  nextS +
                  (isArray ? "" : `"${key}":${isSpace ? " " : ""}`) +
                  getString(ThisObject[key], nextS, isSpace);
              } catch (error) {}
              First = true;
            }
            ThisObject[unsafeProperty] = undefined;
            return (
              ReturnString +
              "" +
              (space ?? false ? "\n" + before : "") +
              (isArray ? "]" : "}")
            );
          } else {
            return "{...}";
          }
        default:
          return JSON.stringify(ThisObject);
      }
    }
    return getString(startObject, "", space ?? "" != "");
  }

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
  }
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
  }
  /**
   *
   * @param {number | string} hours
   * @param {string} left1 осталось
   * @param {string} left2 осталась
   * @param {string} left3 осталось
   * @returns {string}
   */
  toSecString(seconds, left1, left2, left3) {
    let s = `секунд${left1 ? ` ${left1}` : ""}`;
    sec = `${seconds}`;
    if (sec.endsWith("1") && sec != "11") {
      s = `секунда${left2 ? ` ${left2}` : ""}`;
    } else if (sec.endsWith("2") || sec.endsWith("3") || sec.endsWith("4")) {
      s = `секунды${left3 ? ` ${left3}` : ""}`;
    }
    return `${sec} ${s}`;
  }
  /**
   *
   * @param {number | string} hours
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
  }
  add(array, value) {
    const a = Array.isArray(array) ? array : [],
      es = [];
    if (!a.includes(value)) a.push(value);
    a.forEach((e) => {
      if (!es.includes(e)) es.push(e);
    });
    return es;
  }
  /**
   *
   * @param {Error} err
   * @param {boolean} returnArr
   * @returns
   */
  errParse(err, returnArr, twoTypes) {
    if (typeof err != "object" || !err.stack || !err.message) return err;
    let parsedErrMsg,
      parsedErrStack,
      parsedErrType = "Error: ",
      arr;
    parsedErrMsg = err.message;
    parsedErrStack = err.stack.replace(err.message, "").split("\n");
    if (!parsedErrStack[0].match(/\s+at\s/g))
      parsedErrType = parsedErrStack.shift();
    if (parsedErrMsg.match(/\d{3}:\s/g)) {
      parsedErrType = `${parsedErrType.replace(": ", "")} ${
        parsedErrMsg.split(": ")[0]
      }: `;
      parsedErrMsg = parsedErrMsg.split(": ").slice(1).join(": ");
    }
    parsedErrStack = parsedErrStack
      .map((e) => e.replace(/\s+at\s/g, ""))
      .map((e) =>
        e.includes("internal")
          ? "Internal"
          : e.includes("telegraf")
          ? "TelegrafAPI"
          : e.includes("redis")
          ? "RedisClient"
          : e
      )
      .map((e) => `\n   at ${e}`);
    parsedErrStack = parsedErrStack.join("");
    if (twoTypes)
      arr = [
        `${parsedErrType}${
          parsedErrType.endsWith(": ") ? " " : ": "
        }${parsedErrMsg}`,
        parsedErrStack,
        err.on ? format.stringifyEx(err.on, " ") : undefined,
      ];
    else
      arr = [
        parsedErrType,
        parsedErrMsg,
        parsedErrStack,
        err.on ? format.stringifyEx(err.on, " ") : undefined,
      ];
    return returnArr
      ? arr
      : `${parsedErrType}${
          parsedErrType.endsWith(":") ? " " : ": "
        }${parsedErrMsg} ${parsedErrStack}`;
  }
  getName(user) {
    return (
      `${user?.first_name}${user?.last_name ? ` ${user.last_name}` : ""}` ??
      user?.username ??
      user?.id
    );
  }
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  /**
   *
   * @param {String} msg
   * @param {Function} method
   */
  sendSeparatedMessage(msg, method, limit = 4000) {
    if (msg.length < limit) return method(msg);

    for (let p = 1; p <= Math.ceil(msg.length / limit); p++) {
      method(msg.substring(p * limit - limit, p * limit));
    }
  }
}
export const format = new formatter();

export const d = {
  user: (id) => `User::${id}`,
  pn: (prefix, name) => `${prefix}::${name}`,
  group: (id) => `Group::${id}`,
  session: (name, stage) => `${name}::${stage}`,
  // Query link
  query: (prefix, name, ...args) =>
    `${prefix}${d._s.q}${name}${args ? `${d._s.d}${args.join(d._s.a)}` : ""}`,
  // Separator
  _s: {
    q: "/",
    d: "?=",
    a: "::",
  },
  guide: (index) => `https://t.me/xillerbotguides/${index}`,
};
