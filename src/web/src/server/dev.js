import { devEnv, load as link_bot_api } from "./link-bot-api.js";
import express from "express";
import { routeBase, applyRouters } from "virtual:vite-plugin-api:router";

const handler = express();
const router = express.Router();
handler.use(routeBase, router);

async function main() {
  await devEnv();
  await link_bot_api();
  applyRouters(
    ({ method, route, cb }) => {
      if (router[method]) {
        console.log("[api]", method, route);
        router[method](route, cb);
      } else {
        console.log("[api] Not support '" + method + "' in express");
      }
    },
    (cb) => async (req, res, next) => {
      if (!res.finished) {
        try {
          let value = await cb(req, res, next);
          if (value) {
            res.send(value);
          }
        } catch (error) {
          next(error);
        }
      }
    }
  );
}

main()

export { handler };
