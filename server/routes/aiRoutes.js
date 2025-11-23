const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Carpeta temporal

const { consultAI, analyzeContract } = require('../controllers/aiController');

// Ruta chat normal
router.post('/consult', consultAI);

// NUEVA RUTA: Subir y Analizar
router.post('/analyze', upload.single('contractPdf'), analyzeContract);

module.exports = router;