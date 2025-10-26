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

export const LOG_LEVELS = {
  INFO: "info",
  ERROR: "error",
  WARN: "warn",
  DEBUG: "debug",
} as const;
export type TLogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];

export const hypertubeLogger: TLogger = {
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

export const specificLogger = (name: string): TLogger => {
  return {
    info: (message: string) => {
      pinoLogger.info(`[${name}] ${message}`);
    },
    error: (message: string) => {
      pinoLogger.error(`[${name}] ${message}`);
    },
    warn: (message: string) => {
      pinoLogger.warn(`[${name}] ${message}`);
    },
    debug: (message: string) => {
      pinoLogger.debug(`[${name}] ${message}`);
    },
  };
};

export type TLogger = Record<TLogLevel, (message: string) => void>;
