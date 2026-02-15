import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/linkvault',
  sessionSecret: process.env.SESSION_SECRET || 'change-me',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB || 25),
  cleanupCron: process.env.CLEANUP_CRON || '*/2 * * * *',
  allowedMimeTypes: (process.env.ALLOWED_MIME_TYPES || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
};
