import { button, p, div, a, br } from "@fusorjs/dom/html";
import type { OCOwner } from "./ocs.ts";
import { Link } from "../web/router.ts";

export function CharacterOwner(owner: OCOwner) {
  const wrapper = div(
    { style: "padding: 0px;" },
    button(owner.name, {
      click$e() {
        if (!("nextElementSibling" in this)) return;
        const c = this.nextElementSibling as HTMLDivElement;
        c.style.maxHeight =
          c.style.maxHeight === "0px" ? c.scrollHeight + "px" : "0px";

        wrapper.update();

        api<OCOwner["ocs"]>("oc/owner", {
          body: { ownerid: owner.id },
          token: true,
        })
          .then((res) => {
            owner.ocs = res;
            wrapper.update();
          })
          .catch(alert);
      },
    }),
    div(
      {
        style:
          "max-height: 0; overflow: hidden; transition: max-height 0.2s ease-in-out; padding: 0px 0px;",
      },
      () => (owner.ocs.length ? OC(owner) : p(i18n`Loading...`))
    )
  );
  return wrapper;
}

function OC(owner: OCOwner) {
  const ocs = [];
  for (const [i, e] of owner.ocs.entries()) {
    ocs.push(Link(`/oc/${owner.id}/${i}`, e.name));
    ocs.push(br());
  }
  ocs.push(br());

  return div(...ocs);
}
