const asyncHandler = require("express-async-handler");
const Notification = require("../models/notificationModel");
const { default: mongoose } = require("mongoose");

const getNotifications = asyncHandler(async (req, res) => {
  const { limit, page } = req.params;
  let skipVal = limit * (page - 1);
  const notifRes = await Notification.aggregate([
    {
      $match: { receiver: req.user._id, expired: false },
    },
    { $sort: { upAt: -1 } },
    { $skip: Number(skipVal) },
    { $limit: Number(limit) },
    {
      $lookup: {
        from: "users",
        localField: "sender",
        foreignField: "_id",
        as: "senders",
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "products",
      },
    },

    {
      $project: {
        _id: 1,
        status: 1,
        receiver: 1,
        seen: 1,
        type: 1,
        upAt: 1,
        productId: {
          _id: { $first: "$products._id" },
          name: { $first: "$products.name" },
          image: { $first: "$products.image.uri" },
        },
        senderInfo: {
          _id: { $last: "$senders._id" },
          name: { $last: "$senders.name" },
          photo: { $last: "$senders.photo" },
          role: { $last: "$senders.role" },
          count: { $size: "$senders" },
        },
      },
    },
  ]);
  res.status(200).json(notifRes);
});

const seeNotification = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  const notifRes = await Notification.updateMany(
    { _id: { $in: ids } },
    { seen: true }
  );
  if (notifRes) {
    res.status(200).json({ message: "success" });
  }
});
const pressNotificaton = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notifRes = await Notification.findOneAndUpdate(
    { _id: id },
    { status: true }
  );
  if (notifRes) {
    res.status(200).json({ message: "success" });
  }
});

const addNotif = asyncHandler(async (req, res) => {
  const { id } = req.body;

  const sd = await Notification.create({
    receiver: id,
    type: "sub",
    sender: [req.user.id],
  });
  console.log("sd", sd);
  res.status(201).json(sd);
});

module.exports = {
  seeNotification,
  getNotifications,
  addNotif,
  pressNotificaton,
};
