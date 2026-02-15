import app from './app.js';
import { env } from './config/env.js';
import { connectDb, dropLegacyTtlIndexIfExists } from './config/db.js';
import { startCleanupJob } from './jobs/cleanupJob.js';

async function bootstrap() {
  await connectDb();
  await dropLegacyTtlIndexIfExists();
  startCleanupJob();

  app.listen(env.port, () => {
    console.log(`API running on http://localhost:${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
