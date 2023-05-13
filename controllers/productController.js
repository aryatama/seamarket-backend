const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const { fileSizeFormatter } = require("../utils/fileUpload");
const cloudinary = require("cloudinary").v2;

const createProduct = asyncHandler(async (req, res) => {
  const { name, price, desc, pricePer } = req.body;

  //   Validation
  if (!name || !price || !pricePer) {
    res.status(400);
    throw new Error("Masukan data produk dengan benar");
  }

  //Handle Image upload
  const generateImageFromBuffer = (buffer) => {
    let _buffer = new Buffer.from(buffer, "base64");
    return _buffer.toString("base64");
  };

  let fileData = {};
  if (req.file) {
    //Save image to cloudinary
    let base64Str = generateImageFromBuffer(req.file.buffer);
    let imageFile = `data:${req.file.mimetype};base64,${base64Str}`;
    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(imageFile, {
        folder: "Seamarket Post",
        resource_type: "image",
      });
    } catch (err) {
      res.status(500);
      throw new Error("Image could not be uploaded");
    }
    console.log(uploadedFile);
    fileData = {
      // fileName: req.file.originalname,
      fileName: uploadedFile.original_filename,
      public_id: uploadedFile.public_id,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }

  //Create Product
  const product = await Product.create({
    user: req.user.id,
    name,
    price,
    pricePer,
    desc,
    image: fileData,
  });

  res.status(201).json(product);
});

//Get all product
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ user: req.user.id }).sort("-createdAt");
  res.status(200).json(products);
});

//Get Single product
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  console.log("error", product);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }

  res.status(200).json(product);
});

//Delete Product
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }
  await product.deleteOne();

  res.status(200).json({ message: "Product deleted" });
});

const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, desc } = req.body;
  const { id } = req.params;

  const product = await Product.findById(id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }

  //Handle Image upload

  let fileData = {};
  if (req.file) {
    //Save image to cloudinary
    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "Seamarket Post",
        resource_type: "image",
      });
    } catch (err) {
      res.status(500);
      throw new Error("Image could not be uploaded");
    }
    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }

  //Update Product
  const updatedProduct = await Product.findByIdAndUpdate(
    { _id: id },
    {
      name,
      price,
      desc,
      image: Object.keys(fileData).length === 0 ? product.image : fileData,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json(updatedProduct);
});

const getProductPagination = asyncHandler(async (req, res) => {
  const { key, limit, page } = req.params;
  let skipVal = limit * (page - 1);
  const searchData = await Product.find(
    { name: new RegExp(key, "i") },
    { limit: limit, skip: skipVal }
  );
  res.status(200).json(searchData);
});

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  deleteProduct,
  updateProduct,
  getProductPagination,
};
