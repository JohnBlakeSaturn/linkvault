const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  uploadType: { type: String, enum: ['text', 'file'], required: true },
  content: { type: String },
  fileName: { type: String },
  filePath: { type: String },
  fileSize: { type: Number },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

const UploadModel = mongoose.model('Upload', uploadSchema);

class Upload {
  static async create(data) {
    return await UploadModel.create(data);
  }

  static async findById(id) {
    return await UploadModel.findOne({ id: id });
  }

  static async delete(id) {
    await UploadModel.deleteOne({ id: id });
  }

  static async findExpired() {
    return await UploadModel.find({ expiresAt: { $lt: new Date() } });
  }
}

module.exports = Upload;