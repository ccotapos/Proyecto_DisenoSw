const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  googleId: { type: String },
  // NUEVOS CAMPOS:
  photo: { type: String, default: "" }, 
  position: { type: String, default: "" }, 
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);