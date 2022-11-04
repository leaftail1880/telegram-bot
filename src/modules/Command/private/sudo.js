import { Command } from "../../../lib/Class/Cmd.js";
import { sudo } from "../../../sudo.js";

new Command(
  {
    name: "r",
    aliases: ["sudo"],
    description: "Исполнитель",
    permisson: 2,
    hide: true,
    type: "all",
  },
  sudo
);
