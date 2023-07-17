import { section, button, h1 } from "@fusorjs/dom/html";
import { Open } from "../web/router.ts";

export function Subscriptions() {
  return section(
    h1(i18n`Subscriptions`),
    button({click$e: () => Open("/home")}, i18n`Home`),
  )
}