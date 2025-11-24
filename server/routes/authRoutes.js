const express = require('express');
const router = express.Router();
const { register, login, googleLogin, updateProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');


router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin); 
router.put('/profile', auth, updateProfile); 

module.exports = router;