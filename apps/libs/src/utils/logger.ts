import pino from "pino";

const pinoLogger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

export const hypertubeLogger = {
  info: (message: string) => {
    pinoLogger.info(message);
  },
  error: (message: string) => {
    pinoLogger.error(message);
  },
  warn: (message: string) => {
    pinoLogger.warn(message);
  },
};
