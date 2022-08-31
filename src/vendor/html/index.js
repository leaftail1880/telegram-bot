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
    changes.forEach((c) => changelog.push(`<section>- ${c}</section>`));
    changes.push('<br />')
  }
}

import("./changelog.js").then(() => {
  const html = `
  <!DOCTYPE html>
  
  <!-- Open Graph Generated: a.pr-cy.ru -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="Кобольдя">
  <meta property="og:description" content="Текущее состояние, версия и список изменений">
  <meta property="og:url" content="https://xiller-tg-bot.onrender.com/">
  <!-- Open Graph: Article -->
  
  <html>
    <head>
      <title>Кобольдя</title>
    </head>
    <body>
      <h3>Состояние:</h3>
      <section>Бот работает стабильно! Версия: ${data.versionMSG}</section>
      <br />
      ${changelog.join(" ")}
    </body>
  </html>
  `;

  app.get("/", (_req, res) => res.type("html").send(html));
});
