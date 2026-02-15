const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');
const uploadController = require('../controllers/uploadController');
const { createRateLimiter } = require('../middleware/rateLimit');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const safeExt = path.extname(file.originalname || '');
    const uniqueName = `${randomUUID()}${safeExt}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024  // 10MB limit
  }
});

const uploadRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  limit: 10,
  scope: 'upload',
});

const readRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  limit: 120,
  scope: 'read',
});

function handleUpload(req, res, next) {
  upload.single('file')(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Max size is 10MB.' });
      }
      return res.status(400).json({ error: error.message });
    }

    return res.status(400).json({ error: 'Invalid upload payload' });
  });
}

// Routes
router.post('/upload', uploadRateLimiter, handleUpload, uploadController.createUpload);
router.get('/content/:id', readRateLimiter, uploadController.getContent);
// uploadRoutes.js - Add this new route
router.get('/content/:id/info', readRateLimiter, uploadController.getContentInfo);
router.delete('/content/:id', readRateLimiter, uploadController.deleteContent);

module.exports = router;
