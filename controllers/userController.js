const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Product = require("../models/productModel");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Mohon masukan semua data dengan benar");
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error("Password tidak boleh kurang dari 6 karakter");
  }
  // Check if user email already exists
  const isUserExists = await User.findOne({ email });
  if (isUserExists) {
    res.status(400);
    throw new Error("Email telah terdaftar, mohon masukan email yang berbeda");
  }

  let uniqueID = crypto.randomBytes(3).toString("hex");
  const photo = `https://robohash.org/set_set1/bgset_bg1/${uniqueID}?size=400x400`;

  //Create new user
  const user = await User.create({
    name,
    email,
    password,
    photo: photo,
  });

  //Generate Token
  const token = generateToken(user._id);

  if (user) {
    const {
      _id,
      name,
      email,
      photo,
      phone,
      about,
      address,
      subscription,
      subscribers,
      availableWA,
      status,
      role,
    } = user;

    res.status(201).json({
      _id,
      name,
      email,
      photo,
      phone,
      about,
      address,
      token,
      subscription,
      subscribers,
      availableWA,
      status,
      role,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Please add email and password");
  }
  //Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("User not found, please sign up");
  }

  //User exists. check if password is correct
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  let isUsingResetPassword = false;
  if (user.resetpass) {
    isUsingResetPassword = await bcrypt.compare(password, user.resetpass);
  }

  //Generate Token
  const token = generateToken(user._id);

  if (user && isPasswordCorrect) {
    const {
      _id,
      name,
      email,
      photo,
      phone,
      about,
      address,
      subscription,
      subscribers,
      availableWA,
      status,
      role,
    } = user;
    res.status(200).json({
      _id,
      name,
      email,
      photo,
      phone,
      about,
      address,
      token,
      subscription,
      subscribers,
      availableWA,
      status,
      role,
    });
  } else if (user && isUsingResetPassword) {
    const { _id, name, email, photo, phone, about, address } = user;
    res.status(200).json({
      message: "Login with reset password successful",
      _id,
      name,
      email,
      photo,
      phone,
      about,
      address,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid email or password");
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  //Send HTTP-Only Cookie to expire user token
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0), // 1 day
    sameSite: "none",
    secure: false,
  });
  return res.status(200).json({ message: "Successfully Logged Out" });
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    const {
      _id,
      name,
      email,
      photo,
      phone,
      about,
      address,
      subscription,
      subscribers,
      availableWA,
      status,
      role,
    } = user;
    res.status(200).json({
      _id,
      name,
      email,
      photo,
      phone,
      about,
      address,
      subscription,
      subscribers,
      availableWA,
      status,
      role,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    const {
      _id,
      name,
      email,
      photo,
      phone,
      about,
      address,
      subscription,
      subscribers,
      availableWA,
      status,
      role,
    } = user;
    res.status(200).json({
      _id,
      name,
      email,
      photo,
      phone,
      about,
      address,
      subscription,
      subscribers,
      availableWA,
      status,
      role,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    const {
      name,
      email,
      photo,
      phone,
      about,
      address,
      availableWA,
      role,
      status,
    } = user;
    user.email = email;
    user.name = req.body.name || name;
    user.phone = req.body.phone || phone;
    user.photo = req.body.photo || photo;
    user.about = req.body.about || about;
    user.address = req.body.address || address;
    user.availableWA = req.body.availableWA || availableWA;
    user.role = req.body.role || role;
    user.status = req.body.status || status;

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      email: updatedUser.email,
      name: updatedUser.name,
      phone: updatedUser.phone,
      photo: updatedUser.photo,
      about: updatedUser.about,
      address: updatedUser.address,
      availableWA: updatedUser.availableWA,
      role: updatedUser.role,
      status: updatedUser.status,
      subscribers: updatedUser.subscribers,
      subscription: updatedUser.subscription,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { oldPassword, password } = req.body;

  if (!user) {
    res.status(404);
    throw new Error("User not found, please signup");
  }
  if (!oldPassword || !password) {
    res.status(400);
    throw new Error("Please add old and new password");
  }

  //Check if old password matches password in DB
  const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
  let isUsingResetPassword = false;
  if (user.resetpass) {
    isUsingResetPassword = await bcrypt.compare(oldPassword, user.resetpass);
  }
  if (user && isPasswordCorrect) {
    user.password = password;
    await user.save();
    res.status(200).json("Password changed successfully");
  } else if (user && isUsingResetPassword) {
    user.password = password;
    user.resetpass = undefined;
    await user.save();
    res.status(200).json("Password changed by reset successfully");
  } else {
    res.status(400);
    throw new Error("Old password is incorrect");
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User does not exists");
  }

  let resetedPassword = crypto.randomBytes(3).toString("hex");
  console.log("resetedPassword", resetedPassword);
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(resetedPassword, salt);
  user.resetpass = hashedPassword;
  await user.save();

  const message = `
  <h2>Hello ${user.name}</h2>
  <p>Gunakan kode ini sebagai <b>password</b> sementara untuk masuk ke aplikasi SeaMarket :<p>
  <h3>${resetedPassword}</h3>
  `;

  res.send("forgot password");
});

const subscribe = asyncHandler(async (req, res) => {
  const { id } = req.body;
  const userToSub = await User.findById(id);
  const user = await User.findById(req.user.id);
  if (!userToSub) {
    res.status(404);
    throw new Error("User does not exists");
  }
  const isSubscribed = await User.exists({ subscription: id }).select({
    _id: req.user.id,
  });
  if (isSubscribed) {
    res.status(400);
    throw new Error("Already Subscribed");
  }

  await userToSub.subscribers.push(req.user.id);
  await user.subscription.push(id);
  const updatedUser = await userToSub.save();
  const updatedMyUser = await user.save();

  res.status(200).json({ myUser: updatedMyUser, user: updatedUser });
});

const unsubscribe = asyncHandler(async (req, res) => {
  const { id } = req.body;
  const userToSub = await User.findById(id);
  const user = await User.findById(req.user.id);
  if (!userToSub) {
    res.status(404);
    throw new Error("User does not exists");
  }
  const isSubscribed = await User.exists({ subscription: id }).select({
    _id: req.user.id,
  });
  if (!isSubscribed) {
    res.status(400);
    throw new Error("You are not Subscribed");
  }

  await userToSub.subscribers.pull(req.user.id);
  await user.subscription.pull(id);
  const updatedUser = await userToSub.save();
  const updatedMyUser = await user.save();

  res.status(200).json({ myUser: updatedMyUser, user: updatedUser });
});

const searchUser = asyncHandler(async (req, res) => {
  const { key, limit, page } = req.params;
  let skipVal = limit * (page - 1);
  const searchData = await User.find(
    { name: new RegExp(key, "i"), role: "penjual" },
    "name photo",
    { limit: limit, skip: skipVal }
  );
  res.status(200).json(searchData);
});

const getSomeUser = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  if (!ids) {
    res.status(400);
    throw new Error("bad req");
  }
  const someUser = await User.find({ _id: { $in: ids } }, "name photo");
  res.status(200).json(someUser);
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  getUserById,
  updateUser,
  changePassword,
  forgotPassword,
  subscribe,
  unsubscribe,
  searchUser,
  getSomeUser,
};

// //Create reset Token
// let resetToken = crypto.randomBytes(32).toString("hex") + user._id;
// // Hash token before saving to DB
// const hashedToken = crypto
//   .createHash("sha256")
//   .update(resetToken)
//   .digest("hex");

// await new Token({
//   userId: user._id,
//   token: hashedToken,
//   createdAt: Date.now(),
//   expiresAt: Date.now() + 30 * (60 * 1000), // 30minutes
// }).save();
