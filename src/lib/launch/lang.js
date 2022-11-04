import config from "../../config.js";
import { Xitext } from "../Class/Xitext.js";
import { data } from "../start-stop.js";

export const start_stop_lang = {
  launchLOG: (reason) => `> ${data.versionLOG} [${reason}]`,
  stopRes: (reason) => `% ${data.versionLOG} stopped. ${reason}`,
  stop: {
    noRespLog: () => start_stop_lang.stopRes("No response"),
    terminate: () => start_stop_lang.stopRes(`Terminated`),
    old: () => `${data.versionLOG} stopped. OLD`,
    freeze: () => `$ ${data.versionMSG} freezed.`,
    freezeLOG: () => start_stop_lang.stopRes(`FRZ!`),
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
      (plgs) =>
        console.log(
          `${(Date.now() - data.start_time) / 1000} sec, Session: ${
            data.session
          }, plugins: ${plgs.join(", ")}`
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
        console.log("Plugins: ");
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
      .Text(`${prefix} Кобольдя `)
      ._Group(data.versionMSG.split(" ")[0])
      .Url(null, `https://koboldie-bot.onrender.com/stop${data.start_time}`)
      .Bold()
      ._Group()
      .Text(" ")
      .Italic(info ? info : data.versionMSG.split(" ")[1] ?? false)
      ._Build({ disable_web_page_preview: true }),
};
