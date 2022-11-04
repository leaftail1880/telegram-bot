export const env: {
  TOKEN?: string;
  REDIS_URL?: string;
  whereImRunning?: string;
  dev?: string;
  ownerID?: string;
  logID?: string;
};

export const bot: import("telegraf").Telegraf