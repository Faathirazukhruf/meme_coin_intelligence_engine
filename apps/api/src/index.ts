import { buildServer } from './server.js';
import { getConfig } from '@meme-coin/config';
import { defaultLogger } from '@meme-coin/utils';

async function main() {
  const config = getConfig();
  const app = await buildServer();

  try {
    await app.listen({ port: config.PORT, host: config.HOST });
    defaultLogger.info(`Meme Coin Intelligence Engine API running on http://${config.HOST}:${config.PORT}`);
    defaultLogger.info(`Health check available at http://${config.HOST}:${config.PORT}/health`);
  } catch (err) {
    defaultLogger.error({ err }, 'Failed to start API server');
    process.exit(1);
  }
}

main();
