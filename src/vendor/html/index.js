import { app } from "../../app/setup/tg.js";
import { data } from "../../app/start-stop.js";

//

let changelog = [];

export class Change {
  /**
   *
   * @param {String} version
   * @param {Array<String>} changes
   */
  constructor(version, changes) {
    changelog.push(`<h4>v${version}</h4>`);
    changelog.push(`<ul><li>${changes.join("</li><li>")}</li></ul>`);
    changelog.push("<br/>");
  }
}

import("./changelog.js").then(async () => {
  const html2 = `
  <!DOCTYPE html>

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
        margin-block-start: -1em;
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
    </style>
    <title>Кобольдя</title>
  </head>
  <body>
    <h3>Состояние:</h3>
    <p>Бот работает стабильно! Версия: <strong>${data.versionMSG}</strong></p>
    <br>
    <h3>Список изменений:</h3>
    ${changelog.join(" ")}
  </body>
</html>
  `;
  app.get("/", (_req, res) => res.type("html").send(html2));
});
