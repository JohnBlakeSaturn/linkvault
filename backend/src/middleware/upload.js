import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { env } from '../config/env.js';

const DEFAULT_ALLOWED_MIME_TYPES = [
  'text/plain',
  'text/csv',
  'application/pdf',
  'application/json',
  'application/xml',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'audio/mpeg',
  'audio/wav',
  'video/mp4'
];

const ALLOWED_EXTENSIONS = new Set([
  '.txt',
  '.csv',
  '.pdf',
  '.json',
  '.xml',
  '.zip',
  '.rar',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.mp3',
  '.wav',
  '.mp4'
]);

const allowedMimeTypes = new Set(env.allowedMimeTypes.length ? env.allowedMimeTypes : DEFAULT_ALLOWED_MIME_TYPES);

const uploadDir = path.resolve(process.cwd(), env.uploadDir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  }
});

export const upload = multer({
  storage,
  limits: {
    fileSize: env.maxFileSizeMb * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    const mimeType = String(file.mimetype || '').toLowerCase();
    const extension = path.extname(file.originalname || '').toLowerCase();

    const allowedByMime = allowedMimeTypes.has(mimeType);
    const allowedByExtension = ALLOWED_EXTENSIONS.has(extension);

    if (!allowedByMime && !allowedByExtension) {
      const error = new Error('Unsupported file type');
      error.status = 415;
      return cb(error);
    }

    return cb(null, true);
  }
});
