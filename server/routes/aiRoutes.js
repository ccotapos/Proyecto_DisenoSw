const express = require('express');
const router = express.Router();
const { consultAI } = require('../controllers/aiController');

router.post('/consult', consultAI);

module.exports = router;