const WorkEntry = require('../models/WorkEntry');

// 1. OBTENER HISTORIAL (READ)
exports.getEntries = async (req, res) => {
  try {
    // Buscamos solo las del usuario logueado y ordenamos por fecha (más reciente primero)
    const entries = await WorkEntry.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor al obtener horas');
  }
};

// 2. CREAR REGISTRO (CREATE)
exports.createEntry = async (req, res) => {
  const { date, hoursWorked, isOvertime, notes } = req.body;

  try {
    const newEntry = new WorkEntry({
      userId: req.user.id,
      date,
      hoursWorked,
      isOvertime: isOvertime || false,
      notes
    });

    const entry = await newEntry.save();
    res.json(entry);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al guardar el registro');
  }
};

// 3. ELIMINAR REGISTRO (DELETE)
exports.deleteEntry = async (req, res) => {
  try {
    let entry = await WorkEntry.findById(req.params.id);

    if (!entry) return res.status(404).json({ msg: 'Registro no encontrado' });

    // Verificar que el registro pertenezca al usuario que lo quiere borrar
    if (entry.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }

    await WorkEntry.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Registro eliminado' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};