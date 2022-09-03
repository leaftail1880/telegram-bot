import { app } from "../../app/setup/tg.js";
import { data } from "../../app/start-stop.js";

//

let changelog = [];

export class Change {
  /**
   *
   * @param {String} version
   * @param {Array<String>} changes
   */
  constructor(version, changes) {
    changelog.push(`<h4>v${version}</h4>`);
    changes.forEach((c) => changelog.push(`<section>- ${c}</section>`));
    changes.push('<br />')
  }
}

import("./changelog.js").then(async () => {
  const html = await import(".test.html")
   data.versionMSG, changelog.join(" ")
   html

  app.get("/", (_req, res) => res.type("html").send(html));
});
