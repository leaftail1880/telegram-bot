import { Context } from "telegraf";

class formatter {
  stringifyEx(startObject, space = undefined) {
    if (typeof startObject === "string") return startObject
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
  add(array, value) {
    const a = Array.isArray(array) ? array : [],
      es = [];
    if (!a.includes(value)) a.push(value);
    a.forEach((e) => {
      if (!es.includes(e)) es.push(e);
    });
    return es;
  }
  getName(user) {
    return (
      `${user?.first_name}${user?.last_name ? ` ${user.last_name}` : ""}` ??
      user?.username ??
      user?.id
    );
  }
  /**
   *
   * @param {String} msg
   * @param {Context} ctx
   */
  sendSeparatedMessage(msg, ctx, limit = 4000) {
    if (msg.length < limit) return ctx.reply(msg);

    for (let p = 0; p <= msg.length / limit; p++) {
      ctx.reply(msg.substring(p * limit - limit, p * limit));
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
  guide: (index) => `https://t.me/xillerbotguides/${index}`
};
