const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getVacations, addVacation, deleteVacation } = require('../controllers/vacationController');

router.get('/', auth, getVacations);
router.post('/', auth, addVacation);
router.delete('/:id', auth, deleteVacation);

module.exports = router;