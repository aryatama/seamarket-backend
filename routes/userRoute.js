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
} = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/user", protect, getUser);
router.get("/user/:id", protect, getUserById);
router.patch("/updateuser", protect, updateUser);
router.patch("/changepassword", protect, changePassword);
router.post("/forgotpassword", forgotPassword);
router.patch("/subscribe", protect, subscribe);
router.patch("/unsubscribe", protect, unsubscribe);
router.get("/:productId", protect, saveProduct);
router.get("/search/:limit/:page/:key", protect, searchUser);
router.post("/getsomeuser", protect, getSomeUser);

module.exports = router;
