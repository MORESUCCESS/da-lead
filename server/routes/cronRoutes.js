const express = require('express');
const cronRouter = express.Router();
const conFunction = require('../controllers/cronController.js');

cronRouter.post('/generate-leads', conFunction);

module.exports = cronRouter;