import config from "../../config.js";
import { Xitext } from "../Class/Xitext.js";
import { data } from "../start-stop.js";

export const start_stop_lang = {
  launchLOG: (reason) => `⌬ ${data.versionLOG} ${reason}`,
  stop: {
    terminate: () => `${data.versionLOG} принудительно остановлена.`,
    old: () => `${data.versionLOG} выключена как старая`,
    freeze: () =>
      new Xitext()._.group(`$`)
        .url("https://t.me")
        .bold()
        ._.group()
        .text(` ${data.versionMSG} заморожена.`)
        ._.build(),
  },
  runLOG: {
    error: {
      renderError: (err) => console.warn("◔ Error: ", err),
      renderRegister: () =>
        console.warn(
          "◔ Перерегайся: dashboard.render.com/r/red-cc4qn1un6mprie1hdlrg"
        ),
    },
  },
  startLOG: {
    render: [
      () => console.log(`v${config.version.join(".")}`),
      (modules) =>
        console.log(
          `${((Date.now() - data.start_time) / 1000).toFixed(
            2
          )} sec, Session: ${data.session}, Modules:${modules
            .map((e) => `\n [+] ${e}`)
            .join("")}`
        ),
    ],
    dev: [
      () => {
        console.log(" ");
        console.log(
          `> [Load start] Обнаружен Кобольдя v${config.version.join(".")}`
        );
        console.log(" ");
      },
      () => {
        console.log("◔ Подключено");
        console.log(" ");
      },
      () => {
        console.log("Modules: ");
        console.log(" ");
      },
      (plugin, error) => {
        console.warn(`> Error ${plugin}: ` + error.stack);
      },
      (plugin, start) => {
        console.log(`> ${plugin} (${Date.now() - start} ms)`);
      },
      () => {
        console.log(" ");
        console.log("Done.");
        console.log(" ");
        console.log(
          `> [Load end] ${
            (Date.now() - data.start_time) / 1000
          } sec, Session: ${data.session}`
        );
        console.log(" ");
      },
    ],
  },
  start: (info, prefix = "⌬") =>
    new Xitext()
      .text(`${prefix} Кобольдя `)
      ._.group(data.versionMSG.split(" ")[0])
      .url(null, `https://t.me/${data.me}`)
      .bold()
      ._.group()
      .text(" ")
      .italic(info ? info : data.versionMSG.split(" ")[1] ?? false)
      ._.build(),
};
