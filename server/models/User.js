const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Se guardará cifrada
  googleId: { type: String }, // Para el requisito de SSO Google
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);