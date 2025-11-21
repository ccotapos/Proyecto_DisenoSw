const Contract = require('../models/contract');

// 1. Obtener contratos del usuario (READ)
exports.getContracts = async (req, res) => {
  try {
    const contracts = await Contract.find({ userId: req.user.id }).sort({ startDate: -1 });
    res.json(contracts);
  } catch (err) {
    res.status(500).send('Error del servidor');
  }
};

// 2. Agregar nuevo contrato (CREATE)
exports.addContract = async (req, res) => {
  try {
    const { company, role, startDate, type, hoursPerWeek } = req.body;

    const newContract = new Contract({
      userId: req.user.id,
      company,
      role,
      startDate,
      type,
      hoursPerWeek
    });

    const contract = await newContract.save();
    res.json(contract);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al guardar contrato');
  }
};