const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');

// Configuración de Multer (para subir archivos a la carpeta 'uploads')
const upload = multer({ dest: 'uploads/' });

// Importamos TODOS los controladores necesarios
const { 
  getContracts, 
  addContract, 
  uploadContract, 
  updateContract 
} = require('../controllers/contractController');

// --- DEFINICIÓN DE RUTAS ---

// 1. Obtener todos los contratos (GET)
router.get('/', auth, getContracts);

// 2. Crear un contrato nuevo manualmente (POST)
router.post('/', auth, addContract);

// 3. Subir un archivo de contrato (POST) - Usa Multer
router.post('/upload', auth, upload.single('contractFile'), uploadContract);

// 4. Editar un contrato existente (PUT) - NUEVO
router.put('/:id', auth, updateContract);

module.exports = router;