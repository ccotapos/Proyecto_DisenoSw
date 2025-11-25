const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');

const { sendMessage, getUserChats, getChatById, deleteChat } = require('../controllers/aiController');


router.get('/history', auth, getUserChats);       // Lista de chats
router.get('/history/:id', auth, getChatById);    // Chat específico
router.post('/send', auth, sendMessage);          // Enviar pregunta
router.delete('/history/:id', auth, deleteChat);  // Borrar

module.exports = router;