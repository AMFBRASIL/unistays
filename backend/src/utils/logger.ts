import winston from 'winston';
import path from 'path';
import { env } from '@/config/env';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    ({ timestamp, level, message, ...meta }) =>
      `${timestamp} [${level}]: ${message} ${
        Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
      }`
  )
);

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: logFormat,
  defaultMeta: { service: 'unistays-backend' },
  transports: [],
});

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';

// Always log to console (important for Vercel/serverless logs).
logger.add(
  new winston.transports.Console({
    format: consoleFormat,
  })
);

// File transports are disabled on Vercel (read-only filesystem).
if (!isVercel) {
  logger.add(
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
    })
  );
  logger.add(
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
    })
  );
}
