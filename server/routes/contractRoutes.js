const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // ¡Importante! Solo usuarios logueados
const { getContracts, addContract } = require('../controllers/contractController');

router.get('/', auth, getContracts);
router.post('/', auth, addContract);

module.exports = router;