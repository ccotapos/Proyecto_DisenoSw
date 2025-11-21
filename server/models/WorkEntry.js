const mongoose = require('mongoose');

const WorkEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  hoursWorked: { type: Number, required: true },
  isOvertime: { type: Boolean, default: false },
  notes: { type: String }
});

module.exports = mongoose.model('WorkEntry', WorkEntrySchema);