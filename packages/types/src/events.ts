/**
 * Normalized Canonical Event Taxonomy (PRD Section 7 & 9)
 * All canonical events must use UPPER_SNAKE_CASE.
 */

// Token Lifecycle Events
export const TokenEventType = {
  TOKEN_CREATED: 'TOKEN_CREATED',
  TOKEN_METADATA_UPDATED: 'TOKEN_METADATA_UPDATED',
  TOKEN_MIGRATED: 'TOKEN_MIGRATED',
  TOKEN_GRADUATED: 'TOKEN_GRADUATED',
} as const;
export type TokenEventType = (typeof TokenEventType)[keyof typeof TokenEventType];

// Pool / Liquidity Events
export const PoolEventType = {
  POOL_CREATED: 'POOL_CREATED',
  LIQUIDITY_ADDED: 'LIQUIDITY_ADDED',
  LIQUIDITY_REMOVED: 'LIQUIDITY_REMOVED',
  LIQUIDITY_CHANGE: 'LIQUIDITY_CHANGE',
} as const;
export type PoolEventType = (typeof PoolEventType)[keyof typeof PoolEventType];

// Market Events
export const MarketEventType = {
  FIRST_TRADE: 'FIRST_TRADE',
  BUY: 'BUY',
  SELL: 'SELL',
  SWAP: 'SWAP',
  PRICE_UPDATE: 'PRICE_UPDATE',
  VOLUME_SPIKE: 'VOLUME_SPIKE',
} as const;
export type MarketEventType = (typeof MarketEventType)[keyof typeof MarketEventType];

// Wallet Events
export const WalletEventType = {
  WALLET_FIRST_SEEN: 'WALLET_FIRST_SEEN',
  WALLET_FUNDED: 'WALLET_FUNDED',
  TOKEN_RECEIVED: 'TOKEN_RECEIVED',
  TOKEN_TRANSFERRED: 'TOKEN_TRANSFERRED',
  TOKEN_BOUGHT: 'TOKEN_BOUGHT',
  TOKEN_SOLD: 'TOKEN_SOLD',
  CREATOR_ACTIVITY: 'CREATOR_ACTIVITY',
  CREATOR_SELL: 'CREATOR_SELL',
  WALLET_RELATION_DETECTED: 'WALLET_RELATION_DETECTED',
  WALLET_CLUSTER_DETECTED: 'WALLET_CLUSTER_DETECTED',
} as const;
export type WalletEventType = (typeof WalletEventType)[keyof typeof WalletEventType];

// Holder Events
export const HolderEventType = {
  HOLDER_FIRST_SEEN: 'HOLDER_FIRST_SEEN',
  HOLDER_BALANCE_CHANGED: 'HOLDER_BALANCE_CHANGED',
  HOLDER_COUNT_CHANGED: 'HOLDER_COUNT_CHANGED',
  TOP_HOLDER_CHANGED: 'TOP_HOLDER_CHANGED',
  CONCENTRATION_CHANGED: 'CONCENTRATION_CHANGED',
} as const;
export type HolderEventType = (typeof HolderEventType)[keyof typeof HolderEventType];

// Social Events
export const SocialEventType = {
  SOCIAL_MENTION: 'SOCIAL_MENTION',
  SOCIAL_POST: 'SOCIAL_POST',
  SOCIAL_REPLY: 'SOCIAL_REPLY',
  SOCIAL_REPOST: 'SOCIAL_REPOST',
  SOCIAL_ENGAGEMENT_UPDATE: 'SOCIAL_ENGAGEMENT_UPDATE',
  NEW_AUTHOR: 'NEW_AUTHOR',
  AUTHOR_ACTIVITY: 'AUTHOR_ACTIVITY',
} as const;
export type SocialEventType = (typeof SocialEventType)[keyof typeof SocialEventType];

// Narrative Events
export const NarrativeEventType = {
  NARRATIVE_DETECTED: 'NARRATIVE_DETECTED',
  NARRATIVE_UPDATED: 'NARRATIVE_UPDATED',
  NARRATIVE_SPIKE: 'NARRATIVE_SPIKE',
  TOKEN_NARRATIVE_LINKED: 'TOKEN_NARRATIVE_LINKED',
} as const;
export type NarrativeEventType = (typeof NarrativeEventType)[keyof typeof NarrativeEventType];

// System Events
export const SystemEventType = {
  DATA_RECEIVED: 'DATA_RECEIVED',
  DATA_VALIDATED: 'DATA_VALIDATED',
  DATA_NORMALIZED: 'DATA_NORMALIZED',
  DATA_DEDUPLICATED: 'DATA_DEDUPLICATED',
  FEATURE_COMPUTED: 'FEATURE_COMPUTED',
  SCORE_COMPUTED: 'SCORE_COMPUTED',
  SIGNAL_GENERATED: 'SIGNAL_GENERATED',
  ALERT_SENT: 'ALERT_SENT',
  OUTCOME_RECORDED: 'OUTCOME_RECORDED',
  BACKTEST_COMPLETED: 'BACKTEST_COMPLETED',
} as const;
export type SystemEventType = (typeof SystemEventType)[keyof typeof SystemEventType];

export type CanonicalEventType =
  | TokenEventType
  | PoolEventType
  | MarketEventType
  | WalletEventType
  | HolderEventType
  | SocialEventType
  | NarrativeEventType
  | SystemEventType;
