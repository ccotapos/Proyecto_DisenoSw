const mongoose = require('mongoose');

const ContractSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true },
  role: { type: String, required: true }, 
  startDate: { type: Date, required: true },
  type: { type: String, enum: ['Indefinido', 'Plazo Fijo', 'Honorarios'], default: 'Indefinido' },
  hoursPerWeek: { type: Number, default: 45 }, 
  active: { type: Boolean, default: true }
});

module.exports = mongoose.model('Contract', ContractSchema);