const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const protect = asyncHandler(async (req, res, next) => {
  try {
    // console.log("Token", req.headers.authorization)
    // const token = req.cookies.token;
    const token = req.headers.authorization;
    
    if (!token) {
      res.status(401);
      throw new Error("Sesi anda telah habis, silahkan login");
    }
    //Verify Token
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Get user data
    const user = await User.findById(verified.id).select("-password");
    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401);
    throw new Error("Sesi anda telah habis, silahkan login");
  }
});

module.exports = protect;
