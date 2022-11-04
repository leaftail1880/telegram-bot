import { Command } from "../../../lib/Class/Cmd.js";
import { SERVISE } from "../../../lib/start-stop.js";

new Command(
  {
    name: "stop",
    specprefix: true,
    hide: true,
    description: "Bot App",
    permisson: 2,
  },
  (_a, args) => {
    SERVISE.stop("Ручная остановка", null, args[0] ?? false, args[1] ?? false);
  }
);
