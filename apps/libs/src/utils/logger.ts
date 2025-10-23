import pino from "pino";

const pinoLogger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
  level: "debug",
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
  debug: (message: string) => {
    pinoLogger.debug(message);
  },
};
