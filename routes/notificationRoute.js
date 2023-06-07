const express = require("express");

const protect = require("../middleware/authMiddleware");
const { getNotifications, addNotif, seeNotification, pressNotificaton } = require("../controllers/notificationController");

const router = express.Router();

// router.get("/:id", protect, getProduct);
router.get("/:limit/:page", protect, getNotifications);
router.post("/add", protect, addNotif);
router.post("/see", protect, seeNotification);
router.post("/press/:id", protect, pressNotificaton);


module.exports = router;
