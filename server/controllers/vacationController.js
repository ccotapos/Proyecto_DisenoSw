const Vacation = require('../models/vacation');

exports.getVacations = async (req, res) => {
  try {
    const vacations = await Vacation.find({ userId: req.user.id }).sort({ startDate: 1 });
    res.json(vacations);
  } catch (err) {
    res.status(500).send('Error del servidor');
  }
};

exports.addVacation = async (req, res) => {
  try {
    const { startDate, endDate, daysTaken } = req.body;
    const newVacation = new Vacation({
      userId: req.user.id,
      startDate,
      endDate,
      daysTaken
    });
    const vacation = await newVacation.save();
    res.json(vacation);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al guardar vacaciones');
  }
};

exports.deleteVacation = async (req, res) => {
  try {
    await Vacation.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Vacación eliminada' });
  } catch (err) {
    res.status(500).send('Error al eliminar');
  }
};