const Contract = require('../models/Contract');

// 1. Obtener contratos
exports.getContracts = async (req, res) => {
  try {
    const contracts = await Contract.find({ userId: req.user.id }).sort({ startDate: -1 });
    res.json(contracts);
  } catch (err) {
    res.status(500).send('Error del servidor');
  }
};

// 2. Agregar contrato manual
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

// 3. Subir archivo (Upload)
exports.uploadContract = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No se subió ningún archivo');
    }
    const newContract = new Contract({
      userId: req.user.id,
      company: "Importado desde Archivo",
      role: req.file.originalname,
      startDate: new Date(),
      type: 'Indefinido',
      active: true
    });
    await newContract.save();
    res.json({ msg: "Archivo recibido", contract: newContract });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al subir archivo');
  }
};

// 4. Actualizar Contrato (Update)
exports.updateContract = async (req, res) => {
  try {
    let contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ msg: 'Contrato no encontrado' });

    if (contract.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }

    contract = await Contract.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(contract);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al actualizar contrato');
  }
};