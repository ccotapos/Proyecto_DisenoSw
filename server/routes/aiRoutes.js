const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); 

const { consultAI, analyzeContract } = require('../controllers/aiController');

router.post('/consult', consultAI);
router.post('/analyze', upload.single('contractPdf'), analyzeContract);

module.exports = router;