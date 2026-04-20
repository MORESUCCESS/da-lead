const express = require('express');
const isLoggedIn = require('../middleware/auth');
const {autoLeadGen} = require('../controllers/leadFinderController.js');

const leadSuggestionRouter = express.Router();

leadSuggestionRouter.get('/daily', isLoggedIn, autoLeadGen);


module.exports = leadSuggestionRouter;