import { PrismaClient } from '@prisma/client';
import { getConfig } from '@meme-coin/config';

declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

let instance: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (globalThis.__prismaClient) {
    return globalThis.__prismaClient;
  }
  if (!instance) {
    const config = getConfig();
    instance = new PrismaClient({
      datasources: {
        db: {
          url: config.DATABASE_URL,
        },
      },
      log: config.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
    if (process.env['NODE_ENV'] !== 'production') {
      globalThis.__prismaClient = instance;
    }
  }
  return instance;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});
