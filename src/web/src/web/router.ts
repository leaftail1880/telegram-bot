import { section, a } from "@fusorjs/dom/html";
import { Component } from "@fusorjs/dom";

let currentRoute: string;
let app: Component<any>;

export function Router(map: Record<string, Component<any>>) {
  const defaultPage = Object.keys(map)[0];
  const routes = new Map<string | RegExp, Component<any>>();
  for (const [key, comp] of Object.entries(map)) {
    routes.set(key.startsWith("^\\/") ? new RegExp(key, "g") : key, comp);
  }
  currentRoute = location.pathname;
  app = section(
    { id: "top_sect", class: "second" },
    () =>
      [...routes.entries()].find(([route, t]) =>
        route instanceof RegExp
          ? currentRoute.match(route)
          : route === currentRoute
      ) ?? routes.get(defaultPage)
  );

  // setup currentRouter
  window.addEventListener(
    "popstate",
    () => {
      currentRoute = location.pathname;
      app.update();
    },
    false
  );

  return app.element;
}

export function Link(to: string, ...childrens: any) {
  return a(
    {
      href: to,
      click$e(ev) {
        ev.preventDefault();
        Open(to);
      },
    },
    ...childrens
  );
}

export function Open(path: string) {
  currentRoute = path;
  history.pushState(null, "", path);
  app.update();
}

export function Navigate(path: string) {
  return { click$e: () => Open(path) };
}
