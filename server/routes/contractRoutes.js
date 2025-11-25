const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');


const upload = multer({ dest: 'uploads/' });

const { 
  getContracts, 
  addContract, 
  uploadContract, 
  updateContract 
} = require('../controllers/contractController');


router.get('/', auth, getContracts);

router.post('/', auth, addContract);

router.post('/upload', auth, upload.single('contractFile'), uploadContract);

router.put('/:id', auth, updateContract);

module.exports = router;