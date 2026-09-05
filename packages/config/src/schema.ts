import { z } from 'zod';

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  // Database
  DATABASE_URL: z.string().default('postgresql://postgres:postgrespassword@localhost:5432/meme_coin_intelligence?schema=public'),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // S3 / MinIO
  S3_ENDPOINT: z.string().default('http://localhost:9000'),
  S3_REGION: z.string().default('us-east-1'),
  S3_ACCESS_KEY: z.string().default('minioadmin'),
  S3_SECRET_KEY: z.string().default('minioadminpassword'),
  S3_BUCKET_RAW_EVENTS: z.string().default('raw-events'),
  S3_BUCKET_BACKTESTS: z.string().default('backtest-artifacts'),
  S3_FORCE_PATH_STYLE: z.coerce.boolean().default(true),

  // Solana & Providers
  SOLANA_RPC_URL: z.string().default('https://api.mainnet-beta.solana.com'),
  HELIUS_API_KEY: z.string().optional().default(''),
  HELIUS_RPC_URL: z.string().optional().default(''),
  BITQUERY_API_KEY: z.string().optional().default(''),
  BIRDEYE_API_KEY: z.string().optional().default(''),
  DEXSCREENER_API_URL: z.string().default('https://api.dexscreener.com'),

  // Social / News
  TWITTER_BEARER_TOKEN: z.string().optional().default(''),
  TELEGRAM_BOT_TOKEN: z.string().optional().default(''),

  // Versions
  DATASET_VERSION: z.string().default('dataset_v1'),
  PARSER_VERSION: z.string().default('parser_v1'),
  FEATURE_VERSION: z.string().default('feature_v1'),
  RISK_VERSION: z.string().default('risk_v1'),
  OPPORTUNITY_VERSION: z.string().default('opportunity_v1'),
  SCORING_VERSION: z.string().default('scoring_v1'),
  DECISION_VERSION: z.string().default('decision_v1'),
  STRATEGY_VERSION: z.string().default('strategy_v1'),
  CODE_VERSION: z.string().default('1.0.0'),
});

export type EnvConfig = z.infer<typeof EnvSchema>;
