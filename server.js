const dotenv = require("dotenv").config();
const express = require("express");
const { default: mongoose } = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/errorMiddleware");
const userRoute = require("./routes/userRoute");
const productRoute = require("./routes/productRoute");
const notificationRoute = require("./routes/notificationRoute");
const path = require("path");

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: ["http://localhost:5000", "https://seamarket-api.up.railway.app"],
    credentials: true,
  })
);

app.use("/uploads", express.static(__dirname));

//Routes Middleware
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/notification", notificationRoute);

// Route
app.get("/", (req, res) => {
  res.send("Welcome to SeaMarket");
});

//Error Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
//ConnectDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));
