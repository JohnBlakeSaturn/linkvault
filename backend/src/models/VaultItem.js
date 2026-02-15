import mongoose from 'mongoose';

const vaultItemSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    type: {
      type: String,
      enum: ['text', 'file'],
      required: true
    },
    textContent: {
      type: String,
      maxlength: 100000
    },
    file: {
      originalName: String,
      storedName: String,
      mimeType: String,
      size: Number,
      path: String
    },
    passwordHash: {
      type: String,
      default: null
    },
    oneTimeView: {
      type: Boolean,
      default: false
    },
    maxViews: {
      type: Number,
      min: 1,
      max: 10000,
      default: null
    },
    viewCount: {
      type: Number,
      default: 0
    },
    expiresAt: {
      type: Date,
      required: true
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true
    }
  },
  { timestamps: true }
);

export const VaultItem = mongoose.model('VaultItem', vaultItemSchema);
