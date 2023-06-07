const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Product = require("../models/productModel");
const { default: mongoose } = require("mongoose");
const { fileSizeFormatter } = require("../utils/fileUpload");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const { promisify } = require("util");
const Notification = require("../models/notificationModel");
const unlinkAsync = promisify(fs.unlink);

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
      saved,
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
      saved,
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
      saved,
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
      saved,
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
      saved,
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
      saved,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  const productCount = await Product.estimatedDocumentCount({
    user: req.params.id,
  });

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
      productCount: productCount,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  let fileData = {};
  if (req.file) {
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "Seamarket Profile",
        resource_type: "image",
      });
      await unlinkAsync(req.file.path);
    } catch (err) {
      res.status(500);
      throw new Error("Image could not be uploaded");
    }
    // console.log(uploadedFile);
    if (user?.photo_public_id) {
      await cloudinary.uploader.destroy(user.photo_public_id);
    }
    fileData = {
      fileName: uploadedFile.original_filename,
      public_id: uploadedFile.public_id,
      uri: uploadedFile.secure_url,
      type: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }

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
      photo_public_id,
    } = user;
    user.email = email;
    user.name = req.body.name || name;
    user.phone = req.body.phone || phone;
    user.photo = fileData?.uri || photo;
    user.about = req.body.about || about;
    user.address = req.body.address || address;
    user.availableWA = req.body.availableWA || availableWA;
    user.role = req.body.role || role;
    user.status = req.body.status || status;
    user.photo_public_id = fileData?.public_id || photo_public_id || null;

    const updatedUser = await user.save();
    res.status(200).json(updatedUser);

    // res.status(200).json({
    //   _id: updatedUser._id,
    //   email: updatedUser.email,
    //   name: updatedUser.name,
    //   phone: updatedUser.phone,
    //   photo: updatedUser.photo,
    //   about: updatedUser.about,
    //   address: updatedUser.address,
    //   availableWA: updatedUser.availableWA,
    //   role: updatedUser.role,
    //   status: updatedUser.status,
    //   subscribers: updatedUser.subscribers,
    //   subscription: updatedUser.subscription,
    // });
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
  const { subscription } = user;
  if (subscription.includes(id)) {
    res.status(400);
    throw new Error("Already Subscribed");
  }

  await userToSub.subscribers.push(req.user.id);
  await user.subscription.push(id);
  const updatedUser = await userToSub.save();
  const updatedMyUser = await user.save();

  //Notif
  const notifRes = await Notification.findOne({
    receiver: id,
    type: "sub",
    sender: req.user.id,
  });
  if (notifRes) {
    notifRes.expired = false;
    await notifRes.save();
  } else {
    await Notification.create({
      receiver: id,
      type: "sub",
      sender: [req.user.id],
    });
  }

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
  const { subscription } = user;
  if (!subscription.includes(id)) {
    res.status(400);
    throw new Error("You are not Subscribed");
  }

  await userToSub.subscribers.pull(req.user.id);
  await user.subscription.pull(id);
  const updatedUser = await userToSub.save();
  const updatedMyUser = await user.save();

  //Notif
  const notifRes = await Notification.findOne({
    receiver: id,
    type: "sub",
    sender: req.user.id,
  });
  if (notifRes) {
    notifRes.expired = true;
    await notifRes.save();
  }

  res.status(200).json({ myUser: updatedMyUser, user: updatedUser });
});

const saveProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  // console.log("product id", productId);
  const product = await Product.findById(productId);
  const user = await User.findById(req.user.id);
  if (!product) {
    res.status(404);
    throw new Error("Produk tidak ditemukan");
  }

  //Notif
  const notifRes = await Notification.findOne({
    receiver: product.user,
    type: "save",
    productId: productId,
  });

  if (user.saved.includes(productId)) {
    await product.saver.pull(req.user.id);
    await user.saved.pull(productId);
    if (notifRes) {
      if (notifRes.sender.length === 1) {
        notifRes.expired = true;
      }
      await notifRes.sender.pull(req.user.id);
      await notifRes.save();
    }
  } else {
    await product.saver.push(req.user.id);
    await user.saved.push(productId);
    if (notifRes) {
      if (notifRes.sender.length === 0) {
        notifRes.expired = false;
      }
      await notifRes.sender.push(req.user.id);
      notifRes.upAt = new Date();
      await notifRes.save();
    } else {
      await Notification.create({
        receiver: product.user,
        type: "save",
        productId: productId,
        sender: [req.user.id],
      });
    }
  }

  const updatedProduct = await product.save();
  const updatedUser = await user.save();

  res.status(200).json({ product: updatedProduct });
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

const getSubUserByNewProduct = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  if (!ids) {
    res.status(400);
    throw new Error("bad req");
  }
  const objIds = ids.map((el) => {
    return new mongoose.Types.ObjectId(el);
  });
  // let today = new Date("2023-05-25");
  let today = new Date().toDateString();
  const someUser = await User.aggregate([
    { $match: { _id: { $in: objIds } } },
    // { $match: { name: "Budi Pancing" } },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "user",
        as: "products",
      },
    },
    { $unwind: "$products" },
    // { $match: { "products.name": "Ikan bawal" } },
    {
      $match: {
        "products.createdAt": { $gte: new Date(today) },
      },
    },
    {
      $group: {
        _id: "$_id",
        // name: "$name",
        name: { $first: "$name" },
        photo: { $first: "$photo" },
        // productid: { $first: "$products._id" },
        // name: { $first: "$products.name" },
      },
    },
  ]);

  if (someUser) {
    res.status(200).json(someUser);
  } else {
    res.status(400);
    throw new Error("getSubUserByNewProduct");
  }
});
const getUserByNewProduct = asyncHandler(async (req, res) => {
  let today = new Date().toDateString();
  const user = await User.findById(req.user.id);
  const { subscription, _id } = user;
  // let today = new Date("2023-05-25");
  // console.log(subscription);
  const someUser = await User.aggregate([
    {
      $match: {
        _id: { $nin: [...subscription, _id] },
        role: "penjual",
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "user",
        as: "products",
      },
    },
    { $unwind: "$products" },
    // {
    //   $match: {
    //     "products.createdAt": { $gte: new Date(today) },
    //   },
    // },
    {
      $sort: {
        "products.createdAt": -1,
      },
    },
    { $limit: 10 },
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        photo: { $first: "$photo" },
        address: { $first: "$address" },
      },
    },
  ]);

  if (someUser) {
    res.status(200).json(someUser);
  } else {
    res.status(400);
    throw new Error("getUserByNewProduct");
  }
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
  saveProduct,
  getSubUserByNewProduct,
  getUserByNewProduct,
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
