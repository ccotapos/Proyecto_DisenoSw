const WorkEntry = require('../models/WorkEntry');


exports.getEntries = async (req, res) => {
  try {
    const entries = await WorkEntry.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor al obtener horas');
  }
};


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


exports.deleteEntry = async (req, res) => {
  try {
    let entry = await WorkEntry.findById(req.params.id);

    if (!entry) return res.status(404).json({ msg: 'Registro no encontrado' });
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