const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');

const { sendMessage, getUserChats, getChatById, deleteChat } = require('../controllers/aiController');


router.get('/history', auth, getUserChats);       
router.get('/history/:id', auth, getChatById);    
router.post('/send', auth, sendMessage);         
router.delete('/history/:id', auth, deleteChat);  

module.exports = router;