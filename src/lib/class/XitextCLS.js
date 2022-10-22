export class Button {
  constructor(text = "btn") {
    /**
     * @type {import("telegraf/types").InlineKeyboardButton}
     */
    // @ts-ignore
    this.btn = {};
    this.btn.text = text;
  }
  url(url) {
    // @ts-ignore
    if (url) this.btn.url = url;
    return this.btn;
  }
  data(data) {
    // @ts-ignore
    if (data) this.btn.callback_data = data;
    return this.btn;
  }
}

export class Xitext {
  constructor() {
    this._text = "";
    this._entities = [];
    this.offset = 0;
    this.prev = null;
    this.group = false;
    this._inlineKeyboard = [];
  }
  Text(text) {
    let t = `${text}`;
    this.offset = this.offset + t.length;
    this._text = this._text + t;
    return this;
  }
  _Group(text) {
    if (!text && this.group) {
      this.group = false;
      this.offset = this.offset + this.prev.length ?? 0;
      this.prev = null;
    } else if (text) {
      this.group = true;
      const t = `${text}`;
      this.prev = t;
      this._text = this._text + t;
    }
    return this;
  }
  Bold(text) {
    let t = !this.group ? `${text}` : this.prev;
    if (!t) return this;
    /**
     * @type {import("telegraf/types").MessageEntity}
     */
    const ent = {
      type: "bold",
      length: t.length,
      offset: this.offset,
    };
    this._entities.push(ent);
    if (!this.group) {
      this.offset = this.offset + ent.length;
      this._text = this._text + t;
    }
    return this;
  }
  Italic(text) {
    let t = !this.group ? `${text}` : this.prev;
    if (!t) return this;
    /**
     * @type {import("telegraf/types").MessageEntity}
     */
    const ent = {
      type: "italic",
      length: t.length,
      offset: this.offset,
    };
    this._entities.push(ent);
    if (!this.group) {
      this.offset = this.offset + ent.length;
      this._text = this._text + t;
    }
    return this;
  }
  Underline(text) {
    let t = !this.group ? `${text}` : this.prev;
    if (!t) return this;
    /**
     * @type {import("telegraf/types").MessageEntity}
     */
    const ent = {
      type: "underline",
      length: t.length,
      offset: this.offset,
    };
    this._entities.push(ent);
    if (!this.group) {
      this.offset = this.offset + ent.length;
      this._text = this._text + t;
    }
    return this;
  }
  Strike(text) {
    let t = !this.group ? `${text}` : this.prev;
    if (!t) return this;
    /**
     * @type {import("telegraf/types").MessageEntity}
     */
    const ent = {
      type: "strikethrough",
      length: t.length,
      offset: this.offset,
    };
    this._entities.push(ent);
    if (!this.group) {
      this.offset = this.offset + ent.length;
      this._text = this._text + t;
    }
    return this;
  }
  Spoiler(text) {
    let t = !this.group ? `${text}` : this.prev;
    if (!t) return this;
    /**
     * @type {import("telegraf/types").MessageEntity}
     */
    const ent = {
      type: "spoiler",
      length: t.length,
      offset: this.offset,
    };
    this._entities.push(ent);
    if (!this.group) {
      this.offset = this.offset + ent.length;
      this._text = this._text + t;
    }
    return this;
  }
  Url(text, url) {
    let t = !this.group ? `${text}` : this.prev;
    if (!t || !url) return this;
    /**
     * @type {import("telegraf/types").MessageEntity}
     */
    const ent = {
      type: "text_link",
      length: t.length,
      offset: this.offset,
      url: url,
    };
    this._entities.push(ent);
    if (!this.group) {
      this.offset = this.offset + ent.length;
      this._text = this._text + t;
    }
    return this;
  }
  Mention(text, User) {
    let t = !this.group ? `${text}` : this.prev;
    if (!t || !User) return this;
    /**
     * @type {import("telegraf/types").MessageEntity}
     */
    const ent = {
      type: "text_mention",
      length: t.length,
      offset: this.offset,
      user: User,
    };
    this._entities.push(ent);
    if (!this.group) {
      this.offset = this.offset + ent.length;
      this._text = this._text + t;
    }
    return this;
  }
  Mono(text) {
    let t = !this.group ? `${text}` : this.prev;
    if (!t) return this;
    /**
     * @type {import("telegraf/types").MessageEntity}
     */
    const ent = {
      type: "code",
      length: t.length,
      offset: this.offset,
    };
    this._entities.push(ent);
    if (!this.group) {
      this.offset = this.offset + ent.length;
      this._text = this._text + t;
    }
    return this;
  }
  Code(text, language = "JavaScript") {
    let t = !this.group ? `${text}` : this.prev;
    if (!t || !language) return this;
    /**
     * @type {import("telegraf/types").MessageEntity}
     */
    const ent = {
      type: "pre",
      language: language,
      length: t.length,
      offset: this.offset,
    };
    this._entities.push(ent);
    if (!this.group) {
      this.offset = this.offset + ent.length;
      this._text = this._text + t;
    }
    return this;
  }
  /**
   *
   * @param  {...Array<import("telegraf/types").InlineKeyboardButton>} lines
   */
  InlineKeyboard(...lines) {
    this._inlineKeyboard = lines;
    return this;
  }
  /**
   *
   * @param {import("telegraf/types").Convenience.ExtraReplyMessage} extra
   * @returns {[string, import("telegraf/types").Convenience.ExtraReplyMessage]}
   */
  _Build(extra = {}, move = 0) {
    /**
     * @type {import("telegraf/types").Convenience.ExtraReplyMessage}
     */
    const EXTRA = Object.assign(extra);
    if (move != 0) {
      this._entities.forEach((e) => (e.offset += move));
    }
    if (!EXTRA.disable_web_page_preview) {
      EXTRA.disable_web_page_preview = true;
    }
    if (Array.isArray(this._entities) && this._entities[0])
      EXTRA.entities = this._entities;
    if (
      Array.isArray(this._inlineKeyboard) &&
      this._inlineKeyboard[0] &&
      Array.isArray(this._inlineKeyboard[0])
    ) {
      if (typeof EXTRA.reply_markup != "object") EXTRA.reply_markup = {
        inline_keyboard: this._inlineKeyboard
      };
    }
    return [this._text ?? "empty Xitext()", EXTRA];
  }
  /**
   *
   * @returns {import("telegraf/types").Convenience.ExtraReplyMessage}
   */
  static newExtra() {
    return {};
  }
}