import { Command } from "../../../lib/Class/Cmd.js";
import { Xitext } from "../../../lib/Class/Xitext.js";

function getLink(search) {
  const p = new URLSearchParams();
  p.append("q", search);
  return "https://google.com/search?" + p.toString();
}

new Command(
  {
    name: "google",
    description: "Гуглит",
    type: "all",
    hide: true,
  },
  (ctx, args) => {
    /**
     * @type {{text?: string; caption?: string; message_id?: number}}
     */
    const msg = ctx.message.reply_to_message;
    const text = msg.text ?? args.join(" ");
    if (!text)
      return ctx.reply("И что я по твоему загуглить должен?", {
        reply_to_message_id: ctx.message.message_id,
        allow_sending_without_reply: true,
      });
    const x = new Xitext().Url(text, getLink(text));
    ctx.reply(
      ...x._Build({
        reply_to_message_id:
          ctx.message.reply_to_message?.message_id ?? ctx.message.message_id,
        allow_sending_without_reply: true,
      })
    );
  }
);
