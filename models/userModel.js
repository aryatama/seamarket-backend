const { default: mongoose } = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "Please add a name"],
    },
    email: {
      type: String,
      require: [true, "Please add an email"],
      unique: true,
      trim: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please add an valid email",
      ],
    },
    password: {
      type: String,
      require: [true, "Please add a password"],
      minLength: [6, "Password must be up to 6 characters"],
      // maxLength: [23, "Password must not be more than 23 characters"],
    },
    resetpass: {
      type: String,
    },
    photo: {
      type: String,
      require: [true, "Please add a photo"],
      default: "https://robohash.org/set_set1/bgset_bg1/dfssdf?size=400x400",
      //https://robohash.org/set_set1/bgset_bg1/dfsdf?size=400x400
    },
    phone: {
      type: String,
      require: [true, "Please add a photo"],
      default: "+628",
    },
    about: {
      type: String,
      maxLength: [250, "The About must not be more than 250 characters"],
    },
    address: {
      type: String,
      maxLength: [100, "The address must not be more than 100 characters"],
      default: "Batam, Batam Center",
    },
  },
  {
    timestamps: true,
  }
);
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  // Encrypt Password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
