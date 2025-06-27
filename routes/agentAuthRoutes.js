const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/agentAuthController');

router.post('/agent/signup', signup);
router.post('/agent/login', login);

module.exports = router;
