const express = require('express');
const router = express.Router();
const { signup, login, getInvestors, deleteInvestor ,getInvestorById,updateInvestor,getInvestorsProperty} = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.get('/investors', getInvestors);
router.get('/investors/property', getInvestorsProperty);
router.delete('/investors/delete/:id', deleteInvestor);
router.get('/investors/detail/:id', getInvestorById);
router.patch('/investors/update', updateInvestor);
module.exports = router;
