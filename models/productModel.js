const { default: mongoose } = require("mongoose");

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "Please add product name"],
      trim: true,
    },
    price: {
      type: String,
      required: [true, "Please add product price"],
      trim: true,
    },
    desc: {
      type: String,
      required: true,
      trim: true,
      default: "Tidak ada deskripsi",
    },
    image: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
