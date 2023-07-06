import { section, p, button } from "@fusorjs/dom/html";

export function Home() {
  return section(() => p("This is home"), button("Da."))
}