const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel.js');



// register new user
const NewUser = async (req, res)=>{
    const {name, email, password} = req.body;

    if(!name || !email || !password)
    {
        return res.status(400).json({success: false, message: "missing details"});
    }

    try {
        const alreadyExist = await userModel.findOne({email});

        if(alreadyExist)
        {
            return res.status(404).json({success:false, message:"User already exist!"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new userModel({name, email, password: hashedPassword});
        
        // save into the database
        await user.save();

        // create or generate a token for the user
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, 
        {expiresIn: '7d'});

        res.cookie('token', token,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none'
            : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const userData = await userModel.findById(user._id).select('-password');
        return res.json(userData);
        
    } catch (error) {
        return res.status(400).json({success: false, message: error.message});
    }
}

// user login controller
const login = async (req, res)=>{
    const {email, password} = req.body;

    if(!email || !password)
    {
        return res.status(400).json({success: false, message: "Email and password are required"});
    }

    try {
        
        const user = await userModel.findOne({email});
        if(!user){
            return res.status(400).json({success:false, message: "invalid email address"});
        }

        // check if password is match if user exist
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch)
        {
            return res.status(400).json({success:false, message: "Invalid password"});
        }

        // generate a token for the user
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, 
        {expiresIn: '7d'});

        res.cookie('token', token,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none'
            : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const userData = await userModel.findById(user._id).select('-password');
        return res.json(userData);

    } catch (error) {
        return res.json({success:false, message: error.message});
    }
}

// logout auth controller
const logout = async(req, res)=>{
    try {
        res.clearCookie('token',{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none'
            : 'strict',
        })

        return res.json({success: true, message: "Logged Out"});
        
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}

// check if user is logged in
const getMe = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
    NewUser,
    login,
    logout,
    getMe
};