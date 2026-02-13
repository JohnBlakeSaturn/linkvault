const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const uploadController = require('../controllers/uploadController');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024  // 10MB limit
  }
});

// Routes
router.post('/upload', upload.single('file'), uploadController.createUpload);
router.get('/content/:id', uploadController.getContent);
// uploadRoutes.js - Add this new route
router.get('/content/:id/info', uploadController.getContentInfo);
router.delete('/content/:id', uploadController.deleteContent);

module.exports = router;