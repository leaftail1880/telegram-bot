import { Xitext } from "../Class/Xitext.js";
import { SERVISE, log } from "../start-stop.js";

/**
 *
 * @param {string} runnerName
 * @param {Function} callback
 * @param {Xitext | string} dataOnError
 * @param {Xitext | string} dataOnSuccesfull
 * @returns
 */
export function safeRun(runnerName, callback, dataOnError, dataOnSuccesfull) {
  try {
    const result = callback();
    if (result?.catch)
      result.catch((e) => {
        SERVISE.error({
          name: `Promise ${runnerName} error: `,
          message: e.message + dataOnError,
          stack: e.stack,
        });
      });
    let txt = `> ${runnerName}. `,
      extra = {};
    if (typeof dataOnSuccesfull === "string" || !dataOnSuccesfull._.build) {
      txt += dataOnSuccesfull;
    } else {
      const temp = dataOnSuccesfull._.build({}, txt.length);
      txt += temp[0];
      extra = temp[1];
    }
    log(txt, extra);
    return true;
  } catch (error) {
    SERVISE.error({
      name: `${runnerName} error: `,
      message: error.message + dataOnError,
      stack: error.stack,
    });
    return false;
  }
}
