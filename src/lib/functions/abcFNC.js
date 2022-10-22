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
  "{": "Х",
  "]": "ъ",
  "}": "Ъ",
  a: "ф",
  s: "ы",
  d: "в",
  f: "а",
  g: "п",
  h: "р",
  j: "о",
  k: "л",
  l: "д",
  ";": "ж",
  ":": "Ж",
  "'": "э",
  '"': "Э",
  z: "я",
  x: "ч",
  c: "с",
  v: "м",
  b: "и",
  n: "т",
  m: "ь",
  ",": "б",
  "<": "Б",
  ".": "ю",
  ">": "Ю",
};

export function abc(msg) {
  if (!msg?.split) return msg;
  let ret = "";
  for (const a of msg.split("")) {
    let l = a;
    if (obj[a]) l = obj[a];
    else if (obj[a.toLowerCase()]) l = obj[a.toLowerCase()].toUpperCase();
    ret = ret + l;
  }
  return ret;
}