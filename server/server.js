const express = require('express');
const cors = require('cors');
require('dotenv').config();
const cookie_parser = require('cookie-parser');
const connectToDb = require('./config/mongodb.js');
const authRouter = require('./routes/authRoutes.js');
const leadRouter = require('./routes/leadRoutes.js');
const dashboardRouter = require('./routes/dashboardRoutes.js');
const leadSuggestionRouter = require('./routes/leadFinderRoutes.js');
const userRouter = require('./routes/userRoutes.js');
const app = express();
// const PORT = process.env.PORT || 3000
connectToDb();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookie_parser());


// authrouter api endpoints
app.use('/api/auth', authRouter);

// leadrouter api endpoints
app.use('/api/leads', leadRouter);

// dashboard stats
app.use('/api/dashboard', dashboardRouter);

// finding lead suggestions
app.use('/api/lead-finder', leadSuggestionRouter);

// message router api endpoints
app.use('/api', require("./routes/messageRoutes.js"));

// user details
app.use('/api/users', userRouter);



// Serve Vite build for frontend routes (This is when I'm done with MVP)
const path = require("path");

app.use(express.static(path.join(__dirname, "../client/dist")));

// Only handle non-API routes
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});





module.exports = app;