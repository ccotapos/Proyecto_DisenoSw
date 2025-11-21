const express = require('express');
const router = express.Router();

// IMPORTANTE: Aquí estamos trayendo las 3 funciones. 
// Si authController no las exporta bien, esto falla.
const { register, login, googleLogin } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin); 

module.exports = router;