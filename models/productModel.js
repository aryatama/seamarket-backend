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
      required: [true, "Masukan Nama Produk"],
      trim: true,
    },
    price: {
      type: String,
      required: [true, "Masukan Harga Produk"],
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
    pricePer: {
      type: String,
      required: [true, "Masukan satuan harga"],
      trim: true,
    },
    expDate: {
      type: Date,
      required: true,
    },
    saver: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
