const obj = {
  q: "й",
  w: "ц",
  e: "у",
  r: "к",
  t: "е",
  y: "н",
  u: "г",
  i: "ш",
  o: "щ",
  p: "з",
  "[": "х",
  "]": "ъ",
};

export function abc(msg) {
  if (!msg?.split) return msg;
  let ret = "";
  for (const a of msg.split("")) {
    if (obj[a])
      ret = ret + a.toLowerCase() == a ? obj[a] : obj[a].toUpperCase();
    else ret = ret + a;
  }
  return ret;
}
