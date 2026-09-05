import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@meme-coin/types': path.resolve(__dirname, './packages/types/src/index.ts'),
      '@meme-coin/config': path.resolve(__dirname, './packages/config/src/index.ts'),
      '@meme-coin/utils': path.resolve(__dirname, './packages/utils/src/index.ts'),
      '@meme-coin/math': path.resolve(__dirname, './packages/math/src/index.ts'),
      '@meme-coin/core': path.resolve(__dirname, './packages/core/src/index.ts'),
      '@meme-coin/database': path.resolve(__dirname, './packages/database/src/index.ts'),
      '@meme-coin/providers': path.resolve(__dirname, './packages/providers/src/index.ts'),
    },
  },
});
