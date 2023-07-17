// Components
import { Router } from "./web/router.ts";
import { Home } from "./views/home.ts";
import { OCs } from "./views/ocs.ts";
import { OC } from "./views/oc.ts";
import { Subscriptions } from "./views/subs.ts";
import { Fetcher } from "./views/fetcher.ts";

// Setup
import "./web/style.css";
import { i18nLoad } from "./web/i18n.ts";
import { fetchAuthToken } from "./web/utils.ts";
import "./web/quill.ts"

Telegram.WebApp.ready();
i18nLoad().then(async () => {
  Telegram.WebApp.MainButton.setParams({
    text: i18n`CLOSE WEBVIEW`,
    is_visible: true,
  });
  Telegram.WebApp.MainButton.onClick(Telegram.WebApp.close);

  try {
    document.body.append(
      Router({
        "/home": Home(),
        "/ocs": OCs(),
        "/subs": Subscriptions(),
        "/fetch": Fetcher(),
        "^\\/oc\\/\\d+/\\d+$": OC(),
      })
    );
  } catch (e) {
    alert(e);
  }

  await fetchAuthToken();
});
