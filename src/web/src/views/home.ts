import { section, p, button } from "@fusorjs/dom/html";
import { Open } from "../web/router.ts";

export function Home() {
  return section(
    () => p(i18n`Select an option`),
    button(
      {
        click$e: () => Open("/ocs"),
      },
      i18n`Characters`
    ),
    button(
      {
        click$e: () => Open("/subs"),
      },
      i18n`Subscriptions`
    )
  );
}
