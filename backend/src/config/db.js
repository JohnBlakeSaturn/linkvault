import mongoose from 'mongoose';
import { env } from './env.js';
import { VaultItem } from '../models/VaultItem.js';

export async function connectDb() {
  await mongoose.connect(env.mongoUri);
  console.log('MongoDB connected');
}

export async function dropLegacyTtlIndexIfExists() {
  try {
    const indexes = await VaultItem.collection.indexes();
    const ttlIndex = indexes.find((index) => index.name === 'expiresAt_1' && typeof index.expireAfterSeconds !== 'undefined');

    if (ttlIndex) {
      await VaultItem.collection.dropIndex('expiresAt_1');
      console.log('Dropped legacy TTL index expiresAt_1');
    }
  } catch (error) {
    if (error.codeName !== 'NamespaceNotFound') {
      console.error('Index migration warning:', error.message);
    }
  }
}
