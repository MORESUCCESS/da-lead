const express = require('express');
const leadRouter = express.Router();
const { getLeads, getLeadById, updateLead, createLead, deleteLead } = require('../controllers/leadController.js');
const isLoggedIn = require('../middleware/auth.js');
const analyzeLead = require('../controllers/leadAnalyzerController.js');
const generateMessage = require('../controllers/messageGeneratorController.js');

leadRouter.get('/', isLoggedIn, getLeads);
leadRouter.get('/:id', isLoggedIn, getLeadById);
leadRouter.patch('/:id', isLoggedIn, updateLead);
leadRouter.post('/', isLoggedIn, createLead);
leadRouter.delete('/:id', isLoggedIn, deleteLead);
leadRouter.post('/:id/analyze', isLoggedIn, analyzeLead);
leadRouter.post('/:id/generate-message', isLoggedIn, generateMessage);

module.exports = leadRouter;