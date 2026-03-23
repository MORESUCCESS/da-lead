const express = require('express');
const isLoggedIn = require('../middleware/auth');
const generateSuggestedLeads = require('../controllers/leadFiniderController');

const leadSuggestionRouter = express.Router();

leadSuggestionRouter.post('/find', isLoggedIn, generateSuggestedLeads);


module.exports = leadSuggestionRouter;