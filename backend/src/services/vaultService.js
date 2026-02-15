import bcrypt from 'bcryptjs';
import { VaultItem } from '../models/VaultItem.js';
import { safeUnlink } from '../utils/file.js';

export async function isAccessAllowed(item, password) {
  if (item.deletedAt) {
    return { ok: false, status: 404, message: 'Content deleted' };
  }

  if (item.expiresAt.getTime() <= Date.now()) {
    return { ok: false, status: 410, message: 'Content expired' };
  }

  const allowedViews = item.oneTimeView ? 1 : item.maxViews;
  if (allowedViews && item.viewCount >= allowedViews) {
    return { ok: false, status: 410, message: 'View limit reached' };
  }

  if (!item.passwordHash) {
    return { ok: true };
  }

  if (!password) {
    return { ok: false, status: 401, message: 'Password required', code: 'PASSWORD_REQUIRED' };
  }

  const isMatch = await bcrypt.compare(password, item.passwordHash);
  if (!isMatch) {
    return { ok: false, status: 401, message: 'Incorrect password', code: 'PASSWORD_INVALID' };
  }

  return { ok: true };
}

export async function bumpViewCount(item) {
  item.viewCount += 1;
  const limit = item.oneTimeView ? 1 : item.maxViews;
  if (limit && item.viewCount >= limit) {
    item.expiresAt = new Date();
  }
  await item.save();
}

export async function deleteItem(item) {
  item.deletedAt = new Date();
  item.expiresAt = new Date();
  await item.save();

  if (item.type === 'file' && item.file?.path) {
    await safeUnlink(item.file.path);
  }
}

export async function purgeExpiredItems() {
  const now = new Date();
  const items = await VaultItem.find({ expiresAt: { $lte: now } }).select('_id type file.path');

  for (const item of items) {
    if (item.type === 'file' && item.file?.path) {
      await safeUnlink(item.file.path);
    }
  }

  if (items.length > 0) {
    await VaultItem.deleteMany({ _id: { $in: items.map((i) => i._id) } });
  }

  return items.length;
}
