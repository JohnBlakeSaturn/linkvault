import path from 'path';
import bcrypt from 'bcryptjs';
import { VaultItem } from '../models/VaultItem.js';
import { generateShareToken } from '../utils/crypto.js';
import { resolveExpiry } from '../utils/date.js';
import { safeUnlink } from '../utils/file.js';
import { bumpViewCount, deleteItem, isAccessAllowed } from '../services/vaultService.js';

export async function createVaultItem(req, res, next) {
  try {
    const { text, expiresAt, password, oneTimeView, maxViews } = req.body;
    const file = req.file;
    const normalizedText = typeof text === 'string' ? text.trim() : '';
    const normalizedPassword = typeof password === 'string' ? password.trim() : '';
    const oneTime = String(oneTimeView) === 'true';
    const hasMaxViewsInput = typeof maxViews !== 'undefined' && String(maxViews).trim() !== '';
    const hasCustomExpiry = typeof expiresAt !== 'undefined' && String(expiresAt).trim() !== '';
    const isAuthenticated = Boolean(req.user);
    const cleanupUpload = async () => {
      if (file?.path) {
        await safeUnlink(file.path);
      }
    };

    if (!normalizedText && !file) {
      return res.status(400).json({ message: 'Upload text or a file' });
    }

    if (normalizedText && file) {
      await cleanupUpload();
      return res.status(400).json({ message: 'Upload either text or file, not both' });
    }

    if (!isAuthenticated && (file || normalizedPassword || oneTime || hasMaxViewsInput || hasCustomExpiry)) {
      await cleanupUpload();
      return res.status(401).json({
        message: 'Login required for file sharing or custom options'
      });
    }

    const expiry = resolveExpiry(expiresAt);
    if (!expiry) {
      await cleanupUpload();
      return res.status(400).json({ message: 'Invalid expiry time' });
    }

    let parsedMaxViews = null;
    if (hasMaxViewsInput) {
      parsedMaxViews = Number(maxViews);
      if (!Number.isInteger(parsedMaxViews) || parsedMaxViews < 1 || parsedMaxViews > 10000) {
        await cleanupUpload();
        return res.status(400).json({ message: 'maxViews must be between 1 and 10000' });
      }
    }

    const item = await VaultItem.create({
      token: generateShareToken(24),
      owner: req.user?._id || null,
      type: normalizedText ? 'text' : 'file',
      textContent: normalizedText || undefined,
      file: file
        ? {
            originalName: file.originalname,
            storedName: path.basename(file.filename),
            mimeType: file.mimetype,
            size: file.size,
            path: file.path
          }
        : undefined,
      passwordHash: normalizedPassword ? await bcrypt.hash(normalizedPassword, 12) : null,
      oneTimeView: oneTime,
      maxViews: oneTime ? 1 : parsedMaxViews,
      expiresAt: expiry
    });

    return res.status(201).json({
      id: item._id,
      url: `${req.protocol}://${req.get('host')}/api/links/${item.token}`,
      frontendUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/l/${item.token}`,
      token: item.token,
      expiresAt: item.expiresAt,
      type: item.type,
      oneTimeView: item.oneTimeView,
      maxViews: item.maxViews,
      passwordProtected: Boolean(item.passwordHash)
    });
  } catch (error) {
    if (req.file?.path) {
      await safeUnlink(req.file.path);
    }
    next(error);
  }
}

export async function getVaultItem(req, res, next) {
  try {
    const { token } = req.params;
    const password = req.query.password || req.headers['x-link-password'];

    const item = await VaultItem.findOne({ token });
    if (!item) {
      return res.status(403).json({ message: 'Invalid link' });
    }

    const access = await isAccessAllowed(item, password);
    if (!access.ok) {
      return res.status(access.status).json({ message: access.message, code: access.code });
    }

    if (item.type === 'text') {
      await bumpViewCount(item);
      return res.json({
        type: 'text',
        text: item.textContent,
        createdAt: item.createdAt,
        expiresAt: item.expiresAt,
        viewCount: item.viewCount
      });
    }

    return res.json({
      type: 'file',
      fileName: item.file.originalName,
      mimeType: item.file.mimeType,
      size: item.file.size,
      downloadUrl: `/api/links/${item.token}/download`,
      createdAt: item.createdAt,
      expiresAt: item.expiresAt,
      viewCount: item.viewCount
    });
  } catch (error) {
    next(error);
  }
}

export async function downloadVaultFile(req, res, next) {
  try {
    const { token } = req.params;
    const password = req.query.password || req.headers['x-link-password'];

    const item = await VaultItem.findOne({ token });
    if (!item) {
      return res.status(403).json({ message: 'Invalid link' });
    }

    if (item.type !== 'file') {
      return res.status(400).json({ message: 'This link contains text, not a file' });
    }

    const access = await isAccessAllowed(item, password);
    if (!access.ok) {
      return res.status(access.status).json({ message: access.message, code: access.code });
    }

    await bumpViewCount(item);

    return res.download(item.file.path, item.file.originalName);
  } catch (error) {
    next(error);
  }
}

export async function listMyItems(req, res, next) {
  try {
    const items = await VaultItem.find({ owner: req.user._id, deletedAt: null })
      .sort({ createdAt: -1 })
      .select('token type expiresAt oneTimeView maxViews viewCount createdAt file.originalName');

    return res.json({ items });
  } catch (error) {
    next(error);
  }
}

export async function deleteMyItem(req, res, next) {
  try {
    const { id } = req.params;
    const item = await VaultItem.findOne({ _id: id, owner: req.user._id, deletedAt: null });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    await deleteItem(item);
    return res.json({ message: 'Item deleted' });
  } catch (error) {
    next(error);
  }
}
