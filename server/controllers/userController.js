const userModel = require("../models/userModel");

const profilePicture = async(req, res)=>{
  try {

    const user = await userModel.findByIdAndUpdate(
      req.user.id,
      {avatar: req.file.path},
      {new: true}
    );
    res.json({success: true, avatar: user.avatar});
  } catch (error) {
    res.status(500).json({success: false, message: "Upload failed"});
  }
}

// fetch user details and display it on settings page
const UserDetails = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User Details not found" });
    }

    return res.status(200).json({ success: true, user: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// update user profile
const UpdateUser = async (req, res) => {
  const { name, freelanceCategory, bio, location} = req.body;

  if (!name && !freelanceCategory && !bio && !location) {
    return res.status(400).json({
      success: false,
      message: "No data to update",
    });
  }

  try {
    // check is user exists and clear cached coordinates if it exists
    const existingUser = await userModel.findById(req.user.id);

    const locationChanged = location && location !== existingUser.location;


    const updatedUser = await userModel.findByIdAndUpdate(
      req.user.id,
      {
        ...(name && { name }),
        ...(freelanceCategory && { freelanceCategory }),
        ...(bio && { bio }),
        ...(location && {location}),
        ...(locationChanged && {cachedLat: '', cachedLon: ''})
      },
      {
        returnDocument: "after", // return updated user
        runValidators: true, // enforce schema rules
      }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: updatedUser,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// user profile picture


module.exports = { UserDetails, UpdateUser, profilePicture };
