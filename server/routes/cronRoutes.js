const express = require('express');
const cronRouter = express.Router();
const isLoggedIn = require('../middleware/auth.js');
const conFunction = require('../controllers/cronController.js');

cronRouter.post('/generate-leads', isLoggedIn, conFunction);

module.exports = cronRouter;