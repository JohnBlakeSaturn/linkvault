const path = require('path');
const fs = require('fs');
const Upload = require('../models/Upload');

// Generate unique ID
function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

// Create upload
exports.createUpload = async (req, res) => {
  try {
    const { text } = req.body;
    const file = req.file;

    // Validate input
    if (!text && !file) {
      return res.status(400).json({ error: 'Text or file is required' });
    }

    if (text && file) {
      return res.status(400).json({ error: 'Cannot upload both text and file' });
    }

    // Generate unique ID
    const id = generateId();

    // Default expiry: 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Build upload data
    const uploadData = {
      id,
      uploadType: text ? 'text' : 'file',
      content: text || null,
      fileName: file ? file.originalname : null,
      filePath: file ? file.path : null,
      fileSize: file ? file.size : null,
      expiresAt
    };

    await Upload.create(uploadData);

    res.status(201).json({
      success: true,
      id,
      expiresAt
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get content by ID
exports.getContent = async (req, res) => {
  try {
    const { id } = req.params;

    // Find upload
    const upload = await Upload.findById(id);

    // Not found
    if (!upload) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Check expiry
    if (new Date() > new Date(upload.expiresAt)) {
      // Delete from DB
      await Upload.delete(id);

      // Delete file if exists
      if (upload.filePath && fs.existsSync(upload.filePath)) {
        fs.unlinkSync(upload.filePath);
      }

      return res.status(410).json({ error: 'Content has expired' });
    }

    // Return based on type
    if (upload.uploadType === 'text') {
      return res.json({
        type: 'text',
        content: upload.content,
        expiresAt: upload.expiresAt
      });
    } else {
      // Check file exists on disk
      if (!fs.existsSync(upload.filePath)) {
        return res.status(404).json({ error: 'File not found on server' });
      }

      return res.download(upload.filePath, upload.fileName);
    }

  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete content manually
exports.deleteContent = async (req, res) => {
  try {
    const { id } = req.params;

    const upload = await Upload.findById(id);

    if (!upload) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Delete file if exists
    if (upload.filePath && fs.existsSync(upload.filePath)) {
      fs.unlinkSync(upload.filePath);
    }

    // Delete from DB
    await Upload.delete(id);

    res.json({ success: true, message: 'Deleted successfully' });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// uploadController.js - Add this
exports.getContentInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const upload = await Upload.findById(id);

    if (!upload) {
      return res.status(404).json({ error: 'Content not found' });
    }

    if (new Date() > new Date(upload.expiresAt)) {
      await Upload.delete(id);
      if (upload.filePath && fs.existsSync(upload.filePath)) {
        fs.unlinkSync(upload.filePath);
      }
      return res.status(410).json({ error: 'Content has expired' });
    }

    // Always return JSON with metadata
    res.json({
      type: upload.uploadType,
      content: upload.content || null,     // null for files
      fileName: upload.fileName || null,
      fileSize: upload.fileSize || null,
      expiresAt: upload.expiresAt
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};