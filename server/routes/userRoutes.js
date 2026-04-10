const express = require('express');
const isLoggedIn = require('../middleware/auth');
const {UserDetails, UpdateUser, profilePicture} = require('../controllers/userController.js');
const { upload } = require('../config/cloudinary.js');

const userRouter = express.Router();

userRouter.get('/', isLoggedIn, UserDetails);
userRouter.put('/', isLoggedIn, UpdateUser);
userRouter.post('/avatar', isLoggedIn, upload.single('avatar'), profilePicture);

module.exports = userRouter;