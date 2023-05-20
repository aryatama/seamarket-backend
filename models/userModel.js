const { default: mongoose } = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "Mohon masukan nama"],
    },
    email: {
      type: String,
      require: [true, "Mohon masukan email"],
      unique: true,
      trim: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please add an valid email",
      ],
    },
    password: {
      type: String,
      require: [true, "Mohon masukan password"],
      minLength: [6, "Password tidak boleh kurang dari 6 karakter"],
      // maxLength: [23, "Password must not be more than 23 characters"],
    },
    resetpass: {
      type: String,
    },
    photo: {
      type: String,
      require: [true, "Mohon tambahkan foto"],
      default: "https://robohash.org/set_set1/bgset_bg1/dfssdf?size=400x400",
      //https://robohash.org/set_set1/bgset_bg1/dfsdf?size=400x400
    },
    phone: {
      type: String,
      maxLength: [20, "No. Phone tidak boleh lebih dari 20 angka"],
    },
    about: {
      type: String,
      maxLength: [250, "Deskripsi tentang tidak boleh lebih dari 250 karakter"],
    },
    address: {
      type: String,
      maxLength: [100, "Alamat tidak boleh lebih dari 100 karakter"],
      default: "",
    },
    availableWA: {
      type: Boolean,
      default: false,
    },
    status: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: "pelanggan",
    },
    subscription: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    subscribers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    saved: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
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
