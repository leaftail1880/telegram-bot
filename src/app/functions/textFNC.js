export function text_parse(text) {
  if (!text.map) return { newtext: text };
  let newtext = "",
    extra = [],
    symbol = 0;
  text.forEach((e) => {
    if (typeof e != "object" || !e.text || !e.extra) {
      newtext = newtext + e;
      symbol = symbol + e.length;
      return;
    }
    /**
     * @type {import("telegraf/typings/core/types/typegram.js").MessageEntity}
     */
    const ent = e.extra;
    ent.offset = symbol;
    symbol = symbol + e.text.length;
    extra.push(e.extra);
    newtext = newtext + e.text;
  });
  return { newtext, extra };
}
export function bold(text) {
  if (!text) return "";
  /**
   * @type {import("telegraf/typings/core/types/typegram.js").MessageEntity}
   */
  const ent = {
    type: "bold",
    length: text.length,
  };
  const obj = {
    text: text,
    extra: ent,
  };
  return obj;
}
export function italic(text) {
  if (!text || !`${text}`) return "";
  /**
   * @type {import("telegraf/typings/core/types/typegram.js").MessageEntity}
   */
  const ent = {
    type: "italic",
    length: text.length,
  };
  const obj = {
    text: text,
    extra: ent,
  };
  return obj;
}
export function underline(text) {
  if (!text || !`${text}`) return "";
  /**
   * @type {import("telegraf/typings/core/types/typegram.js").MessageEntity}
   */
  const ent = {
    type: "underline",
    length: text.length,
  };
  const obj = {
    text: text,
    extra: ent,
  };
  return obj;
}
export function url(text, url) {
  if (!text || !url) return "";
  /**
   * @type {import("telegraf/typings/core/types/typegram.js").MessageEntity}
   */
  const ent = {
    type: "url",
    length: text.length,
  };
  ent.url = url;
  const obj = {
    text: text,
    extra: ent,
  };
  return obj;
}
export function mention(text, user) {
  if (!text || !user) return "у";
  /**
   * @type {import("telegraf/typings/core/types/typegram.js").MessageEntity}
   */
  const ent = {
    type: "text_mention",
    length: text.length,
  };
  ent.user = user;
  const obj = {
    text: text,
    extra: ent,
  };
  return obj;
}
