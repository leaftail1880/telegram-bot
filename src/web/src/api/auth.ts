import crypto from "crypto";

export const POST: Route<{ hash: string, user: string }> = (req, res, next) => {
  if (hashIsValid(req.body?.hash)) {
    console.log("Auth from '" + req.body?.user + "'!");
    return { valid: true, token: generateToken() };
  } else {
    console.log("Invalid auth.");
    return { valid: false };
  }
};

function hashIsValid(telegramInitData: string) {
  const urlParams = new URLSearchParams(telegramInitData);

  const hash = urlParams.get("hash");
  urlParams.delete("hash");
  urlParams.sort();

  let dataCheckString = "";
  for (const [key, value] of urlParams.entries()) {
    dataCheckString += `${key}=${value}\n`;
  }
  dataCheckString = dataCheckString.slice(0, -1);

  const secret = crypto
    .createHmac("sha256", "WebAppData")
    .update(process.env.TOKEN ?? "");
  const calculatedHash = crypto
    .createHmac("sha256", secret.digest())
    .update(dataCheckString)
    .digest("hex");

  return calculatedHash === hash;
}

const tokens: Record<string, number> = {};

function generateToken() {
  const timestamp = Date.now();
  const hash = crypto
    .createHash("sha256")
    .update(timestamp.toString())
    .digest("hex");
  tokens[hash] = timestamp;
  return hash;
}

export function tokenIsValid(token: string) {
  const timestamp = tokens[token];
  if (!timestamp || Date.now() - timestamp >= 1000 * 60 * 60 * 6) return false;
  return true;
}

export const auth: Route<{ token: string }> = (req, _res, next) => {
return next()
  if (tokenIsValid(req.body?.token)) return next();
  else return { valid: false };
};
