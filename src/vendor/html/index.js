import { app } from "../../app/setup/tg.js";

app.get("/", (req, res) => res.type('html').send(html));

const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Бот работает успешно!</title>
  </head>
  <body>
    <section>
      Ы!
    </section>
  </body>
</html>
`