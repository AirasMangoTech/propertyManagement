const express = require('express');
const router = express.Router();
const { signup, login, getInvestors, deleteInvestor } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.get('/investors', getInvestors);
router.delete('/investors/delete/:id', deleteInvestor);
module.exports = router;
