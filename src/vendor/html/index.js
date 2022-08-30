import { app } from "../../app/setup/tg.js";
import { data } from "../../app/start-stop.js";

app.get("/", (req, res) => res.type('html').send(html));

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
    <h3>Список изменений:</h3>
    <h4>v6.2.12</h4>
    <section>- Ы</section>
    <section>- Добавлен список изменений</section>
  </body>
</html>

`