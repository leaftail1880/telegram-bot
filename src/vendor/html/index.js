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
        color: white;
        background-color: black;
        padding: 2%;
      }
      li {
        list-style-type: "- ";
        right: 10px;
        bottom: 10px;
      }
      h4 {
        left: 10px;
      }
      h3 {
        top: 0px;
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
