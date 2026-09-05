import { WorkerRunner } from './worker-runner.js';
import { defaultLogger } from '@meme-coin/utils';

async function main() {
  const runner = new WorkerRunner();
  try {
    await runner.start();
  } catch (err) {
    defaultLogger.error({ err }, 'Worker fatal error');
    process.exit(1);
  }
}

main();
