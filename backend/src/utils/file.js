import fs from 'fs/promises';

export async function safeUnlink(path) {
  try {
    await fs.unlink(path);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Failed to delete file', path, error.message);
    }
  }
}
