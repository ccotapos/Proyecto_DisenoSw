const mongoose = require('mongoose');

const WorkEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  hoursWorked: { type: Number, required: true },
  isOvertime: { type: Boolean, default: false }, // Importante para diferenciar turnos normales de extras
  notes: { type: String, default: "" },          // Para guardar "Cierre de mes", etc.
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WorkEntry', WorkEntrySchema);