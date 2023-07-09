import { section, p, pre, button } from "@fusorjs/dom/html";

export function Fetcher() {
  let data = "EMPTY";
  const wrapper = pre(() => data);
  return section(
    button("Fetch data", {
      async click$e() {
        data = JSON.stringify(JSON.parse(await(await fetch("/api/auth")).text()), null, 2)
        wrapper.update()
      },
    }),
    p("Data:"),
    wrapper
  );
}
