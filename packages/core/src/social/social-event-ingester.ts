import { createHash } from 'node:crypto';
import { prisma } from '@meme-coin/database';
import { createLogger } from '@meme-coin/utils';

const logger = createLogger('social-event-ingester');

export interface RawSocialEventInput {
  tokenId: string;
  platform: 'X' | 'TELEGRAM' | 'DISCORD';
  authorId: string;
  eventType: 'POST' | 'REPLY' | 'QUOTE' | 'RETWEET' | 'TELEGRAM_MESSAGE';
  content: string;
  createdAt: Date;
  engagement?: number;
  followers?: number;
  metadata?: Record<string, unknown>;
}

export interface IngestedSocialEvent {
  id: string;
  tokenId: string;
  platform: string;
  authorId: string;
  eventType: string;
  contentHash: string;
  createdAt: Date;
  engagement: number;
  followers: number;
  isDuplicate: boolean;
}

export class SocialEventIngester {
  private seenHashes: Set<string> = new Set();

  /**
   * Ingests a raw social post/message with content hash deduplication.
   */
  async ingestEvent(input: RawSocialEventInput): Promise<IngestedSocialEvent> {
    const rawContentToHash = `${input.platform}:${input.authorId}:${input.content.trim().toLowerCase()}`;
    const contentHash = createHash('sha256').update(rawContentToHash).digest('hex');

    const isDuplicate = this.seenHashes.has(contentHash);
    if (!isDuplicate) {
      this.seenHashes.add(contentHash);
      if (this.seenHashes.size > 20000) {
        // Keep memory bounded
        const firstEntry = this.seenHashes.values().next().value;
        if (firstEntry) this.seenHashes.delete(firstEntry);
      }
    }

    const eventRecord = {
      id: `soc-${contentHash.slice(0, 16)}`,
      tokenId: input.tokenId,
      platform: input.platform,
      authorId: input.authorId,
      eventType: input.eventType,
      contentHash,
      createdAt: input.createdAt,
      engagement: input.engagement ?? 0,
      followers: input.followers ?? 0,
      isDuplicate,
    };

    if (!isDuplicate) {
      try {
        await prisma.socialEvent.create({
          data: {
            tokenId: input.tokenId,
            platform: input.platform,
            authorId: input.authorId,
            eventType: input.eventType,
            contentHash,
            createdAt: input.createdAt,
            engagement: input.engagement ?? 0,
            followers: input.followers ?? 0,
            metadata: input.metadata as any,
          },
        });
      } catch (err) {
        logger.debug({ err, contentHash }, 'Prisma social write skipped in memory test mode');
      }
    }

    return eventRecord;
  }

  /**
   * Batch ingest social events.
   */
  async ingestBatch(events: RawSocialEventInput[]): Promise<{ ingested: number; duplicates: number }> {
    let ingested = 0;
    let duplicates = 0;

    for (const ev of events) {
      const res = await this.ingestEvent(ev);
      if (res.isDuplicate) {
        duplicates++;
      } else {
        ingested++;
      }
    }

    return { ingested, duplicates };
  }
}

export const socialEventIngester = new SocialEventIngester();
