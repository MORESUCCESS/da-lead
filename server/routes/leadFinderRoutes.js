const express = require('express');
const isLoggedIn = require('../middleware/auth');
const {autoLeadGen} = require('../controllers/leadFiniderController');

const leadSuggestionRouter = express.Router();

leadSuggestionRouter.get('/daily', isLoggedIn, autoLeadGen);


module.exports = leadSuggestionRouter;