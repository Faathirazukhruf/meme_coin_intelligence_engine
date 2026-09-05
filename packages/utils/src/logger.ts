import pino from 'pino';

// Redact known sensitive keys
const redactPaths = [
  'req.headers.authorization',
  'headers.authorization',
  '*.password',
  '*.apiKey',
  '*.secretKey',
  '*.token',
  '*.privateKey',
  '*.accessKey',
  'HELIUS_API_KEY',
  'BITQUERY_API_KEY',
  'BIRDEYE_API_KEY',
  'TWITTER_BEARER_TOKEN',
  'TELEGRAM_BOT_TOKEN',
];

export function createLogger(name: string, level = process.env['LOG_LEVEL'] || 'info') {
  return pino({
    name,
    level,
    redact: {
      paths: redactPaths,
      censor: '[REDACTED]',
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label) => ({ level: label.toUpperCase() }),
    },
  });
}

export const defaultLogger = createLogger('meme-engine');
