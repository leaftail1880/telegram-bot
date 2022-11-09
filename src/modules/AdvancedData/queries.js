import { Query } from "../../lib/Class/Query.js";
import { data } from "../../lib/SERVISE.js";

new Query(
  {
    prefix: "N",
    name: "accept",
  },
  (_ctx, path, edit) => {
    data.joinCodes[Number(path[0])] = 'accepted';
    edit(`Запрос на лс принят (${path[0]})`);
  }
);

new Query(
  {
    prefix: "N",
    name: "group",
  },
  (_ctx, path, edit) => {
    data.joinCodes[Number(path[0])] = 'accepted';
    edit(`Запрос группы принят (${path[0]})`);
  }
);
