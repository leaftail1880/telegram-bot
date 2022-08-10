export const PORT = 3000

export const MEMBERS = {
  // .
  dot: {
    msk: 2,
    start: ['02','00'],
    end: ['06','00']
  },
  // Xiller
  xiller: {
    msk: 0,
    start: ['00','00'],
    end: ['06','00'],
    admin: true
  },
  default: {
    msk: 0,
    start: ['00','00'],
    end: ['07','00']
  },
}