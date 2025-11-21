const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Importamos el middleware
const { getEntries, createEntry, deleteEntry } = require('../controllers/laborController');

// Todas estas rutas están protegidas con "auth"
router.get('/', auth, getEntries);
router.post('/', auth, createEntry);
router.delete('/:id', auth, deleteEntry);

module.exports = router;