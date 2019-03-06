import winston from 'winston';
import expressWinston from 'express-winston';
import uuid from 'uuid/v1';
import opts from '../opts';

const { PROFILING_THRESHOLD_MS } = opts;
const { printf, timestamp, colorize } = winston.format;
const myFormat = printf(info => `${info.timestamp} [${info.level}] ${info.message}`);

const config = logLevel => ({
  format: winston.format.combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    myFormat
  ),
  transports: [
    new winston.transports.Console({
      level: logLevel,
    }),
  ],
});

export const jtos = json => JSON.stringify(json, null, 1);

let memoLogger = null;
export const createLogger = ({ LOG_LEVEL = 'info' } = {}) => {
  if (!memoLogger) {
    const winstonLogger = winston.createLogger(config(LOG_LEVEL));
    memoLogger = {
      silly: (...args) => winstonLogger.silly(args.join(' ')),
      debug: (...args) => winstonLogger.debug(args.join(' ')),
      info: (...args) => winstonLogger.info(args.join(' ')),
      warn: (...args) => winstonLogger.warn(args.join(' ')),
      error: (...args) => winstonLogger.error(args.join(' ')),
      startTimer: () => {
        const thisLogger = memoLogger;
        const startTime = Date.now();
        return {
          update: o => thisLogger.debug(o.ctx, o.message, `${Date.now() - startTime}ms`),
        };
      },
    };
  }
  return memoLogger;
};
export const logger = createLogger(opts);

const makeCtx = (uuid, req) => `[${uuid}:${req.url}]`;

export const timedHandler = async (req, fn) => {
  const ctx = makeCtx(uuid(), req);
  const timer = logger.startTimer();
  await fn({
    update: message => timer.update({ ctx, message }),
  });
  timer.update({ ctx, message: 'done' });
};

export const time = async (m, fn) => {
  const s = Date.now();
  const ret = await fn();
  const e = Date.now() - s;
  if (e >= PROFILING_THRESHOLD_MS) {
    logger.debug(`[TIME] ${m}: elapsed ${e}ms`);
  }
  return ret;
};

export const timeSync = (m, fn) => {
  const s = Date.now();
  const ret = fn();
  const e = Date.now() - s;
  if (e >= PROFILING_THRESHOLD_MS) {
    logger.debug(`[TIME] ${m}: elapsed ${e}ms`);
  }
  return ret;
};

const createExpressLogger = opts => expressWinston.logger(config(opts.LOG_LEVEL));
export const expressLogger = createExpressLogger(opts);
