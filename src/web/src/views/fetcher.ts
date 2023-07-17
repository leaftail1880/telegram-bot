import { section, p, pre, button, h1 } from "@fusorjs/dom/html";
import { Link } from "../web/router.ts";

export function Fetcher() {
  let data = "EMPTY";
  let time = 0;
  const wrapper = section(
    h1(i18n`Fetcher`),
    Link("/home", i18n`Back`),
    button(i18n`Fetch data`, {
      async click$e() {
        time = Date.now();
        data = JSON.stringify(
          await api<any>("test/", { token: true }),
          null,
          2
        );
        time = Date.now() - time;
        wrapper.update();
      },
    }),
    p(i18n`Data:`),
    pre(() => data),
    p(i18n`Time:`),
    pre(() => time)
  );

  return wrapper;
}
