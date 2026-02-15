const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const UserModel = mongoose.model('User', userSchema);

class User {
  static async create(data) {
    return UserModel.create(data);
  }

  static async findByEmail(email) {
    return UserModel.findOne({ email });
  }

  static async findById(id) {
    return UserModel.findById(id);
  }
}

module.exports = User;
