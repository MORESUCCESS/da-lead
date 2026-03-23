const express = require('express');
const isLoggedIn = require('../middleware/auth');
const getDashboardStats = require('../controllers/dashboardController');

const dashboardRouter = express.Router();

dashboardRouter.get('/stats', isLoggedIn, getDashboardStats);

module.exports = dashboardRouter;