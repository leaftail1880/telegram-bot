import { SERVISE_error, log } from "../start-stop.js";

export function safeRun(runnerName, callback, dataOnError, dataOnSuccesfull, sucExtra = {} ) {
  try {
    const result = callback();
    if (result?.catch)
      result.catch((e) => {
        SERVISE_error({
          type: `Promise ${runnerName} error: `,
          message: e.message + dataOnError,
          stack: e.stack,
        });
      });
    log(`> ${runnerName}. ${dataOnSuccesfull}`, sucExtra);
    return true;
  } catch (error) {
    SERVISE_error({
      type: `${runnerName} error: `,
      message: error.message + dataOnError,
      stack: error.stack,
    });
    return false;
  }
}
