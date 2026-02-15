const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const Upload = require('../models/Upload');

const MAX_TEXT_LENGTH = 100000;

function resolveExpiry(expiresAtInput) {
  if (!expiresAtInput) {
    return new Date(Date.now() + 10 * 60 * 1000);
  }

  const parsed = new Date(expiresAtInput);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  if (parsed <= new Date()) {
    return null;
  }

  return parsed;
}

function removeStoredFile(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

function setNoStoreHeaders(res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
}

function buildContentDisposition(fileName) {
  const safeOriginal = path.basename(fileName || 'download');
  const asciiFallback = safeOriginal.replace(/[^\x20-\x7E]+/g, '_').replace(/"/g, '') || 'download';
  const encoded = encodeURIComponent(safeOriginal);
  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`;
}

function invalidLinkResponse(res) {
  setNoStoreHeaders(res);
  return res.status(403).json({ error: 'Invalid or expired link' });
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function getPublicBaseUrl(req) {
  const configuredBaseUrl = process.env.FRONTEND_BASE_URL || process.env.PUBLIC_BASE_URL;
  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/+$/, '');
  }

  const requestOrigin = req.get('origin');
  if (requestOrigin) {
    return requestOrigin.replace(/\/+$/, '');
  }

  return `${req.protocol}://${req.get('host')}`;
}

exports.createUpload = async (req, res) => {
  const file = req.file;

  try {
    const { text, expiresAt } = req.body;
    const normalizedText = typeof text === 'string' ? text.trim() : '';
    const hasText = normalizedText.length > 0;
    const hasFile = Boolean(file);

    if (!hasText && !hasFile) {
      removeStoredFile(file?.path);
      return res.status(400).json({ error: 'Text or file is required' });
    }

    if (hasText && hasFile) {
      removeStoredFile(file.path);
      return res.status(400).json({ error: 'Cannot upload both text and file' });
    }

    if (hasText && normalizedText.length > MAX_TEXT_LENGTH) {
      removeStoredFile(file?.path);
      return res.status(400).json({ error: `Text exceeds max length of ${MAX_TEXT_LENGTH} characters` });
    }

    const resolvedExpiry = resolveExpiry(expiresAt);
    if (!resolvedExpiry) {
      removeStoredFile(file?.path);
      return res.status(400).json({ error: 'Invalid expiresAt. Use a valid future datetime.' });
    }

    const id = randomUUID();

    const uploadData = {
      id,
      uploadType: hasText ? 'text' : 'file',
      content: hasText ? normalizedText : null,
      fileName: file ? path.basename(file.originalname) : null,
      filePath: file ? file.path : null,
      fileSize: file ? file.size : null,
      expiresAt: resolvedExpiry,
    };

    await Upload.create(uploadData);

    const baseUrl = getPublicBaseUrl(req);
    const sharePath = `/content/${id}`;

    return res.status(201).json({
      success: true,
      id,
      url: `${baseUrl}${sharePath}`,
      sharePath,
      expiresAt: resolvedExpiry,
    });
  } catch (error) {
    removeStoredFile(file?.path);
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.getContent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isUuid(id)) {
      return invalidLinkResponse(res);
    }

    const upload = await Upload.findById(id);

    if (!upload) {
      return invalidLinkResponse(res);
    }

    if (new Date() > new Date(upload.expiresAt)) {
      await Upload.delete(id);
      removeStoredFile(upload.filePath);
      return invalidLinkResponse(res);
    }

    if (upload.uploadType === 'text') {
      setNoStoreHeaders(res);
      return res.json({
        type: 'text',
        content: upload.content,
        expiresAt: upload.expiresAt,
      });
    }

    if (!fs.existsSync(upload.filePath)) {
      return invalidLinkResponse(res);
    }

    const fileName = upload.fileName || 'download';
    setNoStoreHeaders(res);
    res.setHeader('Content-Disposition', buildContentDisposition(fileName));
    res.setHeader('Content-Type', 'application/octet-stream');

    const fileStream = fs.createReadStream(upload.filePath);
    fileStream.on('error', (error) => {
      console.error('File stream error:', error);
      if (!res.headersSent) {
        return res.status(500).json({ error: 'Server error' });
      }
      return res.destroy(error);
    });

    return fileStream.pipe(res);
  } catch (error) {
    console.error('Get content error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteContent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isUuid(id)) {
      return res.status(404).json({ error: 'Content not found' });
    }

    const upload = await Upload.findById(id);

    if (!upload) {
      return res.status(404).json({ error: 'Content not found' });
    }

    removeStoredFile(upload.filePath);
    await Upload.delete(id);

    return res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.getContentInfo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isUuid(id)) {
      return invalidLinkResponse(res);
    }

    const upload = await Upload.findById(id);

    if (!upload) {
      return invalidLinkResponse(res);
    }

    if (new Date() > new Date(upload.expiresAt)) {
      await Upload.delete(id);
      removeStoredFile(upload.filePath);
      return invalidLinkResponse(res);
    }

    setNoStoreHeaders(res);
    return res.json({
      type: upload.uploadType,
      content: upload.content || null,
      fileName: upload.fileName || null,
      fileSize: upload.fileSize || null,
      expiresAt: upload.expiresAt,
    });
  } catch (error) {
    console.error('Get content info error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};
