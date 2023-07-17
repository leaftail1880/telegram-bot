import { botApiEnv, botApiLink } from "./link.js";
import express from "express";
import { routeBase, applyRouters } from "virtual:vite-plugin-api:router";

const handler = express();
const router = express.Router();
handler.use(express.json());
handler.use(routeBase, router);

async function main() {
  await botApiEnv();
  await botApiLink();
  applyRouters(
    ({ method, route, cb }) => {
      if (method in router) {
        console.log("[api]", method.toUpperCase(), route);
        // @ts-expect-error
        router[method](route, cb);
      } else {
        console.log("[api] Not support '" + method + "' in express");
      }
    },
    // @ts-expect-error Wrong plugin types.
    (cb) => {
      /** @type {Route} */
      return async (req, res, next) => {
        if (!res.finished) {
          try {
            // @ts-expect-error Again
            let value = await cb(req, res, next);
            if (value) {
              res.send(value);
            }
          } catch (error) {
            res.send("Internal server error: " + error);
          }
        }
      };
    }
  );
}

main();

export { handler };
