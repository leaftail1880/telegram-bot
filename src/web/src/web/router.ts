import { Component, type Child, type StaticChild } from "@fusorjs/dom";

let currentRoute: string;
let app: Component<any>;

export interface PageNavigationData {
	currentRoute: string;
	params: Record<string, string>;
}
type Route =
	| Child
	| StaticChild
	| ((data: PageNavigationData) => Child | StaticChild);

export function Router(map: Record<string, Route>) {
	const defaultPage = Object.keys(map)[0];
	const routes = new Map<string | RegExp, Route>();
	for (const [key, comp] of Object.entries(map)) {
		routes.set(key.startsWith("^\\/") ? new RegExp(key) : key, comp);
	}
	currentRoute = location.pathname;
	app = section({ id: "top_sect", class: "second" }, () => {
		let params: Record<string, any> | null = {};
		const Page =
			[...routes.entries()].find(([route]) =>
				route instanceof RegExp
					? (params = currentRoute.match(route))
					: route === currentRoute
			)?.[1] ?? routes.get(defaultPage);

		return Page instanceof Component
			? Page
			: typeof Page === "function"
			? Page({ currentRoute, params: params.groups ? params.groups : params })
			: Page;
	});

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

type ButtonsNames = "home" | "back";
export const Buttons: Partial<
	Record<ButtonsNames, Component<HTMLButtonElement>>
> = {};
i18n.onload(() => {
	Object.assign(Buttons, {
		home: button(Navigate("/home"), i18n`Home`),
		back: button(
			{
				click$e() {
					history.go(-1);
				},
			},
			i18n`< Back`
		),
	});
});
