const express = require('express');
const router = express.Router();
const { getStats,getInvestorStats } = require('../controllers/statsController');

router.get('/stats', getStats);

router.get('/investorStats', getInvestorStats);


module.exports = router;
