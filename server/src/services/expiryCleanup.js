const fs = require('fs');
const Upload = require('../models/Upload');

const CLEANUP_INTERVAL_MS = 60 * 1000;
let isCleanupRunning = false;

function removeStoredFile(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

async function runExpiryCleanup() {
  if (isCleanupRunning) {
    return 0;
  }

  isCleanupRunning = true;
  const expiredUploads = await Upload.findExpired();

  try {
    for (const upload of expiredUploads) {
      removeStoredFile(upload.filePath);
      await Upload.delete(upload.id);
    }

    return expiredUploads.length;
  } finally {
    isCleanupRunning = false;
  }
}

function startExpiryCleanup() {
  runExpiryCleanup()
    .then((removedCount) => {
      if (removedCount > 0) {
        console.log(`Expired cleanup removed ${removedCount} upload(s)`);
      }
    })
    .catch((error) => {
      console.error('Initial expired cleanup failed:', error);
    });

  const interval = setInterval(async () => {
    try {
      const removedCount = await runExpiryCleanup();
      if (removedCount > 0) {
        console.log(`Expired cleanup removed ${removedCount} upload(s)`);
      }
    } catch (error) {
      console.error('Scheduled expired cleanup failed:', error);
    }
  }, CLEANUP_INTERVAL_MS);

  interval.unref();
}

module.exports = {
  startExpiryCleanup,
};
