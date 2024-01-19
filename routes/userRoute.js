const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  updateUser,
  changePassword,
  forgotPassword,
  subscribe,
  unsubscribe,
  searchUser,
  getSomeUser,
  getUserById,
  saveProduct,
  getSubUserByNewProduct,
  getUserByNewProduct,
  getUserByNewProductByGuest,
} = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");
const { upload } = require("../utils/fileUpload");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/user", protect, getUser);
router.get("/user/:id", getUserById);
router.post("/updateuser", protect, upload.single("image"), updateUser);
router.patch("/changepassword", protect, changePassword);
router.post("/forgotpassword", forgotPassword);
router.patch("/subscribe", protect, subscribe);
router.patch("/unsubscribe", protect, unsubscribe);
router.get("/:productId", protect, saveProduct);
router.get("/search/:limit/:page/:key", searchUser);
router.post("/getsomeuser", protect, getSomeUser);
router.post("/getsubuserbynewproduct", protect, getSubUserByNewProduct);
router.post("/getuserbynewproduct", protect, getUserByNewProduct);
router.post("/getuserbynewproductbyguest", getUserByNewProductByGuest);

module.exports = router;
