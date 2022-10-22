import { SERVISE, log } from "../start-stop.js";

export function safeRun(runnerName, callback, dataOnError, dataOnSuccesfull) {
  try {
    const result = callback();
    if (result?.catch)
      result.catch((e) => {
        SERVISE.error({
          type: `Promise ${runnerName} error: `,
          message: e.message + dataOnError,
          stack: e.stack,
        });
      });
    let txt = `> ${runnerName}. `,
      extra = {};
    if (typeof dataOnSuccesfull === "string" || !dataOnSuccesfull._Build) {
      txt += dataOnSuccesfull;
    } else {
      const temp = dataOnSuccesfull._Build({}, txt.length);
      txt += temp[0];
      extra = temp[1];
    }
    log(txt, extra);
    return true;
  } catch (error) {
    SERVISE.error({
      type: `${runnerName} error: `,
      message: error.message + dataOnError,
      stack: error.stack,
    });
    return false;
  }
}
