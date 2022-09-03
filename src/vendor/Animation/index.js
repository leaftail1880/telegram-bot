import { bot } from "../../app/setup/tg.js";
import { getRegisteredGroups } from "../UserDB/index.js";

const active = {};

/**
 *
 * @param {import("../../app/models.js").DBUgroup} group
 */
function Animate(group) {
  const id = group.static.id;
  if (active[id]) {
    clearInterval(active[id].timer);
    delete active[id];
  }
  const timer = setInterval(() => {
    active[id].stage++;
    if (!group.cache.titleAnimation[active[id].stage]) active[id].stage = 0;
    bot.telegram.setChatTitle(id, group.cache.titleAnimation[active[id].stage]);
  }, Math.round(group.cache.titleAnimationSpeed * 1000));
  active[id] = {
    timer: timer,
    titleAnimation: group.cache.titleAnimation,
    titleAnimationSpeed: group.cache.titleAnimationSpeed,
    stage: 0,
  };
}

export async function SetAnimations() {
  const grp = await getRegisteredGroups();
  for (const group of grp) {
    if (
      group?.cache?.titleAnimation[0] &&
      group.cache?.titleAnimationSpeed?.toFixed &&
      group.cache.titleAnimationSpeed >= 5 &&
      group.cache.titleAnimationSpeed <= 1000 &&
      !(
        active[group.static.id] &&
        active[group.static.id].titleAnimation ==
          group?.cache?.titleAnimation &&
        active[group.static.id].titleAnimationSpeed ==
          group.cache?.titleAnimationSpeed
      )
    )
      Animate(group);
  }
}

SetAnimations()