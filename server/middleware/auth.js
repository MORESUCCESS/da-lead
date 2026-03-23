// check if user is already logged in and get the user id

const jwt = require('jsonwebtoken');

const isLoggedIn = async (req, res,  next)=>{
    const token = req.cookies.token;

    if(!token)
    {
        return res.status(401).json({success: false, message: "Unauthorized"});
    }

    try {
        // decode the token from the cookies
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        if(decodedToken.id)
        {
            req.user = {id: decodedToken.id};
        }else{
            return res.json({success: false, message: "Unauthorized"});
        }

        next();
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

module.exports = isLoggedIn;