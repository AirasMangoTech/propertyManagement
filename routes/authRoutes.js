const express = require('express');
const router = express.Router();
const { signup, login, getInvestors, deleteInvestor ,getInvestorById,updateInvestor} = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.get('/investors', getInvestors);
router.delete('/investors/delete/:id', deleteInvestor);
router.get('/investors/detail/:id', getInvestorById);
router.patch('/investors/update/:id', updateInvestor);
module.exports = router;
