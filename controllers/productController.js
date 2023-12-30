const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const { fileSizeFormatter } = require("../utils/fileUpload");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const { promisify } = require("util");
const Notification = require("../models/notificationModel");
const unlinkAsync = promisify(fs.unlink);

const createProduct = asyncHandler(async (req, res) => {
  const { name, price, desc, pricePer, image } = req.body;

  //   Validation
  if (!name || !price || !pricePer) {
    res.status(400);
    throw new Error("Masukan data produk dengan benar");
  }

  //Handle Image upload
  // const generateImageFromBuffer = (buffer) => {
  //   let _buffer = new Buffer.from(buffer, "base64");
  //   return _buffer.toString("base64");
  // };

  let fileData = {};
  if (req.file) {
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "Seamarket Post",
        resource_type: "image",
      });
      await unlinkAsync(req.file.path);
    } catch (err) {
      res.status(500);
      throw new Error("Image could not be uploaded");
    }
    console.log(uploadedFile);
    fileData = {
      fileName: uploadedFile.original_filename,
      public_id: uploadedFile.public_id,
      uri: uploadedFile.secure_url,
      type: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }
  var future = new Date();

  // Create Product
  const product = await Product.create({
    user: req.user.id,
    name,
    price,
    pricePer,
    desc,
    image: fileData,
    expDate: future.setDate(future.getDate() + 30),
  });
  res.status(201).json(product);
});

//Get all product
const getMyProducts = asyncHandler(async (req, res) => {
  const { limit, page } = req.params;
  let skipVal = limit * (page - 1);
  const products = await Product.find(
    { user: req.user.id },
    "_id name desc image pricePer expDate price createdAt",
    {
      limit: limit,
      skip: skipVal,
    }
  ).sort("-createdAt");
  const productsLenght = await Product.estimatedDocumentCount();

  let response = {
    length: productsLenght,
    products: products,
  };
  res.status(200).json(response);
});

const getProductsPage = asyncHandler(async (req, res) => {
  const { limit, page, id } = req.params;
  let skipVal = limit * (page - 1);
  const products = await Product.find(
    { user: id },
    "_id name desc image pricePer expDate price createdAt",
    {
      limit: limit,
      skip: skipVal,
    }
  )
    .populate("user", "name address photo")
    .sort("-createdAt");
  // const productsLength = await Product.estimatedDocumentCount();
  res.status(200).json(products);
});

const getAllNewestProducts = asyncHandler(async (req, res) => {
  const { limit, page } = req.params;
  let skipVal = limit * (page - 1);
  const products = await Product.find(
    {},
    "_id name desc image pricePer expDate price createdAt",
    // null,
    {
      limit: limit,
      skip: skipVal,
    }
  )
    .populate("user", "name address photo")
    .sort("-createdAt");
  if (products) {
    res.status(200).json(products);
  } else {
    res.status(400);
    throw new Error("bad req");
  }
});

//Get Single product
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "user",
    "name _id address photo"
  );

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.status(200).json(product);
});

//Delete Product
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Produk Tidak Ditemukan");
  }
  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("Anda Tidak Punya Otoritas");
  }
  await product.deleteOne();
  await cloudinary.uploader.destroy(product.image.public_id);
  await Notification.deleteOne({ productId: req.params.id });

  res.status(200).json({ message: "Berhasil Menghapus Produk" });
});

const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, pricePer, desc } = req.body;
  const { id } = req.params;

  const product = await Product.findById(id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("Sesi anda telah habis, silahkan login");
  }

  //Handle Image upload
  let fileData = {};
  if (req.file) {
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "Seamarket Post",
        resource_type: "image",
      });
      await unlinkAsync(req.file.path);
    } catch (err) {
      res.status(500);
      throw new Error("Image could not be uploaded");
    }
    // console.log(uploadedFile);
    if (product?.image?.public_id) {
      await cloudinary.uploader.destroy(product?.image.public_id);
    }
    fileData = {
      fileName: uploadedFile.original_filename,
      public_id: uploadedFile.public_id,
      uri: uploadedFile.secure_url,
      type: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }

  //Update Product
  const updatedProduct = await Product.findByIdAndUpdate(
    { _id: id },
    {
      name,
      price,
      pricePer,
      desc,
      image: Object.keys(fileData).length === 0 ? product.image : fileData,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  // res.status(200).json(updatedProduct);
  res.status(200).json({ message: "success" });
});

const getProductPagination = asyncHandler(async (req, res) => {
  const { key, limit, page } = req.params;
  let skipVal = limit * (page - 1);
  const searchData = await Product.find(
    { name: new RegExp(key, "i") },
    "user name image price pricePer desc saved createdAt",
    { limit: limit, skip: skipVal }
  ).sort("-createdAt");
  res.status(200).json(searchData);
});
const getMyProductPagination = asyncHandler(async (req, res) => {
  const { key, limit, page } = req.params;
  let skipVal = limit * (page - 1);
  const searchData = await Product.find(
    { user: req.user.id, name: new RegExp(key, "i") },
    "user name image price pricePer desc saved createdAt",
    { limit: limit, skip: skipVal }
  ).sort("-createdAt");
  res.status(200).json(searchData);
});

const getSomeProduct = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  if (!ids) {
    res.status(400);
    throw new Error("bad req");
  }
  const someProduct = await Product.find(
    { _id: { $in: ids } },
    "_id user name image price pricePer createdAt photo"
  );
  res.status(200).json(someProduct);
});

const getSubscriptionProduct = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  const { limit, page } = req.params;

  if (!ids) {
    res.status(400);
    throw new Error("bad req");
  }
  let skipVal = limit * (page - 1);
  const searchData = await Product.find(
    { user: { $in: ids } },
    "_id user name image price pricePer createdAt",
    { limit: limit, skip: skipVal }
  )
    .populate("user", "name address photo")
    .sort("-createdAt");
  res.status(200).json(searchData);
});

module.exports = {
  createProduct,
  getMyProducts,
  getProduct,
  deleteProduct,
  updateProduct,
  getProductPagination,
  getProductsPage,
  getSomeProduct,
  getSubscriptionProduct,
  getAllNewestProducts,
  getMyProductPagination
};
