export let VERSION = [6, 1, 4];

export const dev = true;

export const MEMBERS = {
  // .
  dot: {
    msk: 2,
    start: ["00", "00"],
    end: ["05", "00"],
  },
  // Xiller
  xiller: {
    msk: 0,
    start: ["00", "00"],
    end: ["05", "00"],
    admin: true,
  },
  // Hloya
  hloya: {
    msk: 7,
    start: ["00", "00"],
    end: ["05", "00"],
  },
  default: {
    msk: 0,
    start: ["00", "00"],
    end: ["05", "00"],
  },
};

export const PORT = 3546;
