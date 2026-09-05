import { CanonicalEventRecord, ScoreResult, SignalEntity } from '@meme-coin/types';

export interface PipelineStage<TInput, TOutput> {
  readonly name: string;
  process(input: TInput): Promise<TOutput>;
}

export interface IngestionStage extends PipelineStage<unknown, CanonicalEventRecord[]> {}
export interface FeatureEngineStage extends PipelineStage<CanonicalEventRecord[], Record<string, number>> {}
export interface ScoringEngineStage extends PipelineStage<Record<string, number>, ScoreResult> {}
export interface DecisionStage extends PipelineStage<ScoreResult, SignalEntity | null> {}
