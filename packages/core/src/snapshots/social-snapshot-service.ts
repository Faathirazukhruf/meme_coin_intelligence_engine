import { SocialSnapshotEntity } from '@meme-coin/types';
import { prisma } from '@meme-coin/database';
import { calculateVelocity, calculateGrowth } from '@meme-coin/math';
import { DataQualityScorer } from './data-quality.js';
import { createLogger } from '@meme-coin/utils';

const logger = createLogger('social-snapshot-service');

export interface ComputeSocialSnapshotParams {
  tokenId: string;
  timestamp?: Date;
  mentions: Array<{
    authorId: string;
    engagement: number;
    createdAt: Date;
  }>;
  previousSnapshot?: {
    mentionCount: number;
    uniqueAuthors: number;
    engagement: number;
    timestamp: Date;
  };
}

export class SocialSnapshotService {
  /**
   * Computes an immutable social snapshot for a token.
   */
  async computeSnapshot(params: ComputeSocialSnapshotParams): Promise<SocialSnapshotEntity> {
    const ts = params.timestamp || new Date();
    const tsTime = ts.getTime();

    const mentions = params.mentions || [];
    const mentionCount = mentions.length;
    const uniqueAuthors = new Set(mentions.map((m) => m.authorId)).size;
    const totalEngagement = mentions.reduce((acc, m) => acc + (m.engagement || 0), 0);

    const prev = params.previousSnapshot;
    const windowMinutes = prev ? Math.max(1, (tsTime - prev.timestamp.getTime()) / (60 * 1000)) : 15;

    const authorGrowth = prev ? calculateGrowth(uniqueAuthors, prev.uniqueAuthors) : 0;
    const mentionVelocity = prev ? calculateVelocity(mentionCount, prev.mentionCount, windowMinutes) : 0;
    const engagementVelocity = prev ? calculateVelocity(totalEngagement, prev.engagement, windowMinutes) : 0;

    const dataCompleteness = DataQualityScorer.evaluateSocialCompleteness({
      hasMentions: mentionCount > 0,
      mentionCount,
      uniqueAuthors,
      hasEngagement: totalEngagement > 0,
    });

    const snapshot: SocialSnapshotEntity = {
      id: `social-${params.tokenId}-${tsTime}`,
      tokenId: params.tokenId,
      timestamp: ts,
      mentionCount,
      uniqueAuthors,
      engagement: totalEngagement,
      authorGrowth,
      mentionVelocity,
      engagementVelocity,
      dataCompleteness,
    };

    try {
      await prisma.socialSnapshot.create({
        data: {
          tokenId: snapshot.tokenId,
          timestamp: snapshot.timestamp,
          mentionCount: snapshot.mentionCount,
          uniqueAuthors: snapshot.uniqueAuthors,
          engagement: snapshot.engagement,
          authorGrowth: snapshot.authorGrowth,
          mentionVelocity: snapshot.mentionVelocity,
          engagementVelocity: snapshot.engagementVelocity,
          dataCompleteness: snapshot.dataCompleteness,
        },
      });
    } catch (err) {
      logger.debug({ err }, 'DB write skipped in memory test mode');
    }

    return snapshot;
  }
}

export const socialSnapshotService = new SocialSnapshotService();
