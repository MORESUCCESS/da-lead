const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel.js");
const axios = require("axios");

// google auth controller function
const googleAuth = async (req, res) => {
  try {
    const { access_token } = req.body;
    console.log("REQ BODY:", req.body);

    if (!access_token) {
      return res
        .status(400)
        .json({ success: false, message: "No access token provided" });
    }
    const googleRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
    );

    const { name, email, picture } = googleRes.data;

    // check if user does not exist
    let user = await userModel.findOne({ email });

    if (!user) {
      user = await userModel.create({
        name,
        email,
        password: null,
        provider: "google",
        avatar: picture,
      });
    }

    // generate token
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // after generating jwtToken
    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ user });
  } catch (error) {
    console.error("FULL ERROR:", error); // 👈 add this
    console.error("GOOGLE ERROR:", error.response?.data); // 👈 and this

    res.status(400).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};

// register new user
const NewUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "missing details" });
  }

  try {
    const alreadyExist = await userModel.findOne({ email });

    if (alreadyExist) {
      return res
        .status(404)
        .json({ success: false, message: "User already exist!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({ name, email, password: hashedPassword });

    // save into the database
    await user.save();

    // create or generate a token for the user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userData = await userModel.findById(user._id).select("-password");
    return res.json(userData);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// user login controller
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "invalid email address" });
    }

    // for users that logs in with google
    if (user.provider === "google") {
      return res
        .status(400)
        .json({ success: false, message: "Please sign in with google" });
    }

    // check if password is match if user exist
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }

    // generate a token for the user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userData = await userModel.findById(user._id).select("-password");
    return res.json(userData);
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// logout auth controller
const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    return res.json({ success: true, message: "Logged Out" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// check if user is logged in
const getMe = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  NewUser,
  login,
  logout,
  getMe,
  googleAuth,
};
