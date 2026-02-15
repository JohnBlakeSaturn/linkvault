import crypto from 'crypto';

export function generateShareToken(size = 32) {
  return crypto.randomBytes(size).toString('base64url');
}
