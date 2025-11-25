const mongoose = require('mongoose');

const VacationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  daysTaken: { type: Number, required: true }, 
  status: { type: String, default: 'Planificado' }, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Vacation || mongoose.model('Vacation', VacationSchema);
