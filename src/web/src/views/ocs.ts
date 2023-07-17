import { section, h1, button, div } from "@fusorjs/dom/html";
import { Component } from "@fusorjs/dom";
import { Navigate } from "../web/router.ts";
import { CharacterOwner } from "./ocowner.ts";

export interface OCOwner {
  id: string;
  name: string;
  ocs: { fileid: string; description: string, name: string }[];
}

export function OCs() {
  const reloadButton = button({ click$e: fetchOCs }, i18n`Reload`);
  let ownersData: OCOwner[] = [];
  let owners: Component<any>[] = [reloadButton];
  
  const wrapper = section(
    h1(i18n`Characters`),
    button(Navigate("/home"), i18n`Home`),
    () => div({style: "padding: 0px;"}, ...owners)
  );

  async function fetchOCs() {
    const fetchedOwners = await api<[string, string][]>("oc/owners", {
      token: true,
    });

    ownersData = fetchedOwners.map(([id, name]) => {
      return { id, name, ocs: [] };
    });
    owners = ownersData.map(CharacterOwner);
    wrapper.update();
  }

  fetchOCs().catch(alert);

  return wrapper;
}
