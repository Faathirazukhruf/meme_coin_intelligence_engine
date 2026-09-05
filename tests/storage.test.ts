import { describe, it, expect } from 'vitest';
import { InMemoryStorageService } from '@meme-coin/core';

describe('Storage Abstraction Tests', () => {
  it('stores and retrieves raw payload correctly', async () => {
    const storage = new InMemoryStorageService();
    const payload = JSON.stringify({ token: 'SOL', price: 150 });

    await storage.putObject('raw-events', 'events/1.json', payload);
    const retrieved = await storage.getObject('raw-events', 'events/1.json');

    expect(retrieved).toBe(payload);
    expect(JSON.parse(retrieved)).toEqual({ token: 'SOL', price: 150 });
  });

  it('throws on non-existent object', async () => {
    const storage = new InMemoryStorageService();
    await expect(storage.getObject('raw-events', 'non-existent.json')).rejects.toThrow();
  });
});
