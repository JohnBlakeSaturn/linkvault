import cron from 'node-cron';
import { env } from '../config/env.js';
import { purgeExpiredItems } from '../services/vaultService.js';

export function startCleanupJob() {
  cron.schedule(env.cleanupCron, async () => {
    try {
      const count = await purgeExpiredItems();
      if (count > 0) {
        console.log(`[cleanup] removed ${count} expired items`);
      }
    } catch (error) {
      console.error('[cleanup] failed', error.message);
    }
  });
}
