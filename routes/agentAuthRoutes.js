const express = require('express');
const router = express.Router();
const { signup, login, getAgents, deleteAgent, getAgentById, updateAgent } = require('../controllers/agentAuthController');

router.post('/agent/signup', signup);
router.post('/agent/login', login);
router.patch('/update/agent', updateAgent);
router.get('/agent/list', getAgents);
router.delete('/agent/delete/:id', deleteAgent);
router.get('/agent/detail/:id', getAgentById);
module.exports = router;
