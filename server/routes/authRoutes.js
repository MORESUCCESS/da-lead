const express = require('express');
const authRouter = express.Router();

const {NewUser, login, logout, getMe, googleAuth} = require('../controllers/authController.js');
const isLoggedIn = require('../middleware/auth.js');


authRouter.post('/register', NewUser);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.get('/me', isLoggedIn, getMe);
authRouter.post('/google', googleAuth);

authRouter.get('/test', (req, res) => {
  res.json({ message: 'Auth router is working!' });
});


module.exports = authRouter;