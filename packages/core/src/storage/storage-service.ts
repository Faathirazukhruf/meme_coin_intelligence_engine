import { S3Client, PutObjectCommand, GetObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { getConfig } from '@meme-coin/config';
import { createLogger } from '@meme-coin/utils';

const logger = createLogger('storage-service');

export interface StorageService {
  putObject(bucket: string, key: string, data: string | Buffer, contentType?: string): Promise<void>;
  getObject(bucket: string, key: string): Promise<string>;
  healthCheck(): Promise<boolean>;
}

export class S3StorageService implements StorageService {
  private client: S3Client;

  constructor() {
    const config = getConfig();
    this.client = new S3Client({
      endpoint: config.S3_ENDPOINT,
      region: config.S3_REGION,
      credentials: {
        accessKeyId: config.S3_ACCESS_KEY,
        secretAccessKey: config.S3_SECRET_KEY,
      },
      forcePathStyle: config.S3_FORCE_PATH_STYLE,
    });
  }

  async putObject(bucket: string, key: string, data: string | Buffer, contentType = 'application/json'): Promise<void> {
    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: typeof data === 'string' ? Buffer.from(data) : data,
        ContentType: contentType,
      });
      await this.client.send(command);
    } catch (err) {
      logger.error({ bucket, key, err }, 'Failed to upload object to S3 storage');
      throw err;
    }
  }

  async getObject(bucket: string, key: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });
      const response = await this.client.send(command);
      if (!response.Body) {
        throw new Error(`Empty body returned for ${bucket}/${key}`);
      }
      return await response.Body.transformToString();
    } catch (err) {
      logger.error({ bucket, key, err }, 'Failed to fetch object from S3 storage');
      throw err;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const config = getConfig();
      await this.client.send(new HeadBucketCommand({ Bucket: config.S3_BUCKET_RAW_EVENTS }));
      return true;
    } catch {
      return false;
    }
  }
}

export class InMemoryStorageService implements StorageService {
  private store = new Map<string, string>();

  async putObject(bucket: string, key: string, data: string | Buffer): Promise<void> {
    this.store.set(`${bucket}:${key}`, typeof data === 'string' ? data : data.toString('utf-8'));
  }

  async getObject(bucket: string, key: string): Promise<string> {
    const val = this.store.get(`${bucket}:${key}`);
    if (!val) {
      throw new Error(`Key not found: ${bucket}/${key}`);
    }
    return val;
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}
