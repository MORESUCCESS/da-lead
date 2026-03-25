const express = require('express');
const isLoggedIn = require('../middleware/auth');
const {UserDetails, UpdateUser} = require('../controllers/userController.js');

const userRouter = express.Router();

userRouter.get('/', isLoggedIn, UserDetails);
userRouter.put('/', isLoggedIn, UpdateUser);

module.exports = userRouter;