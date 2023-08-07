// Setup
import { Authentication } from "./web/utils.ts";

import "./web/i18n.ts";
import "./web/style.css";

// Components
import { Home } from "./views/home.ts";
import { OC } from "./views/oc.ts";
import { OCs } from "./views/ocs.ts";
import { Subscriptions } from "./views/subs.ts";
import { Router } from "./web/router.ts";

i18n.onload(async () => {
	Telegram.WebApp.MainButton.setParams({
		text: i18n`CLOSE`,
		is_visible: true,
	});
	Telegram.WebApp.MainButton.onClick(Telegram.WebApp.close);

	Authentication.onload(() => {
		document.getElementById("root")!.appendChild(
			Router({
				"/home": Home(),
				"/ocs": OCs(),
				"/subs": Subscriptions(),
				"^\\/oc\\/(?<ownerid>\\d+)/(?<i>\\d+)$": OC(),
			})
		);
		Telegram.WebApp.ready();
	});
});
