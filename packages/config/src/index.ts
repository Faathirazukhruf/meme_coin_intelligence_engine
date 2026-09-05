import dotenv from 'dotenv';
import { EnvConfig, EnvSchema } from './schema.js';
import {
  DEFAULT_RISK_WEIGHTS,
  DEFAULT_OPPORTUNITY_WEIGHTS,
  DEFAULT_DECISION_THRESHOLDS,
  RiskWeightsConfig,
  OpportunityWeightsConfig,
  DecisionThresholdsConfig,
} from './defaults.js';

// Load .env into process.env if not already loaded
dotenv.config();

let cachedConfig: EnvConfig | null = null;

export function getConfig(): EnvConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    const errorDetails = result.error.errors
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join(', ');
    throw new Error(`Configuration validation error: ${errorDetails}`);
  }

  cachedConfig = result.data;
  return cachedConfig;
}

export {
  EnvConfig,
  RiskWeightsConfig,
  OpportunityWeightsConfig,
  DecisionThresholdsConfig,
  DEFAULT_RISK_WEIGHTS,
  DEFAULT_OPPORTUNITY_WEIGHTS,
  DEFAULT_DECISION_THRESHOLDS,
};
