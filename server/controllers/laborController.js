const WorkEntry = require('../models/WorkEntry');

// Obtener todas las entradas del usuario actual
exports.getEntries = async (req, res) => {
  try {
    // req.user.id viene del middleware de autenticación
    const entries = await WorkEntry.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).send('Error del servidor');
  }
};

// Crear una nueva entrada (Create)
exports.createEntry = async (req, res) => {
  const { date, hoursWorked, isOvertime, notes } = req.body;
  try {
    const newEntry = new WorkEntry({
      userId: req.user.id,
      date,
      hoursWorked,
      isOvertime,
      notes
    });
    const entry = await newEntry.save();
    res.json(entry);
  } catch (err) {
    res.status(500).send('Error del servidor');
  }
};

// Eliminar entrada (Delete)
exports.deleteEntry = async (req, res) => {
  try {
    let entry = await WorkEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ msg: 'Entrada no encontrada' });

    // Asegurar que el usuario sea dueño de la entrada
    if (entry.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }

    await WorkEntry.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Entrada eliminada' });
  } catch (err) {
    res.status(500).send('Error del servidor');
  }
};