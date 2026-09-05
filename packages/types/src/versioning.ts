export interface SystemVersionMetadata {
  datasetVersion: string;
  parserVersion: string;
  featureVersion: string;
  riskVersion: string;
  opportunityVersion: string;
  scoringVersion: string;
  decisionVersion: string;
  strategyVersion: string;
  codeVersion: string;
}

export interface AntiLookAheadContext {
  anchorTime: Date;
  maxAllowedTimestamp: Date;
}
