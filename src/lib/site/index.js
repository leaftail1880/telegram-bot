import { EventListener } from "../class/EventsCLS.js";
import { data } from "../start-stop.js";

//
function createHtml(body) {
  return `<!DOCTYPE html>

  <html>
  <head>
      <!-- Open Graph Generated: a.pr-cy.ru -->
      <meta property="og:type" content="article" />
      <meta property="og:title" content="Кобольдя" />
      <meta
        property="og:description"
        content="Текущее состояние, версия и список изменений"
      />
      <meta property="og:url" content="https://xiller-tg-bot.onrender.com/" />
      <!-- Open Graph: Article -->
      <style>
      body {
        background: rgb(25, 77, 142);
        background: linear-gradient(
          304deg,
          rgba(25, 77, 142, 1) 0%,
          rgba(26, 7, 32, 1) 100%
        );
        color: rgb(228, 213, 236);
        /*background-color: rgb(48, 44, 56);*/
        padding: 2%;
        margin: 8px;
        margin-top: -0.25em;
        margin-right: 8px;
        margin-bottom: 8px;
        margin-left: 8px;
      }
      li {
        list-style-type: "- ";
        right: 4pt;
        bottom: 10px;
        margin-top: 3px;
      }
      ul {
        display: block;
        list-style-type: disc;
        margin-block-end: 30px;
        margin-inline-start: 0px;
        margin-inline-end: 0px;
        padding-inline-start: 20px;
      }
      h4 {
        left: 10px;
      }
      h3 {
        top: 0px;
        display: block;
        font-size: 1.17em;
        margin-block-start: 10px;
        margin-block-end: -5px;
        margin-inline-start: 0px;
        margin-inline-end: 0px;
        font-weight: bold;
      }
        .cla {
          margin-inline-start: 1em;
        }
      </style>
      <title>Кобольдя</title>
    </head>
    <body>
    <h1>Кобольдя</h1>
      ${body}
    </body>
  </html>`;
}

let changelog = [],
  html2 = createHtml(`
  <p>Бот запущен! Перезагрузи сайт что бы увидеть список изменений.</p>
`);

export class Change {
  /**
   *
   * @param {String} version
   * @param {Array<String>} changes
   */
  constructor(version, changes, note = null) {
    changelog.push(`<h4>v${version}</h4>`);
    if (note) changelog.push(`<p class="cla">${note}</p>`);
    changelog.push(`<ul><li>${changes.join("</li><li>")}</li></ul>`);
    changelog.push("<br/>");
  }
  static get site() {
    return html2;
  }
}

import("./changelog.js").then(async () => {
  new EventListener(
    "afterpluginload",
    0,
    () =>
      (html2 = createHtml(`
  <h3>Состояние:</h3>
  <p>Бот работает стабильно! Версия: <strong>${data.versionMSG}</strong></p>
  <br>
  <h3>Список изменений:</h3>
  ${changelog.join(" ")}
`))
  );
});
