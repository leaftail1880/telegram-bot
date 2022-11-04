import { Command } from "../../../lib/Class/Cmd.js";
import { sudo } from "../../../sudo.js";

new Command(
  {
    name: "f",
    aliases: ["0", "+", "*", "sudo", "r"],
    description: "Исполнитель",
    permisson: 2,
    specprefix: true,
    type: "all",
  },
  sudo
);
