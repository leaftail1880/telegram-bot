import { Navigate } from "../web/router.ts";

export function Home() {
	return section(
		() => p(i18n`Select an option`),
		button(Navigate("/ocs"), i18n`Characters`),
		button(Navigate("/subs"), i18n`Subscriptions`)
	);
}
