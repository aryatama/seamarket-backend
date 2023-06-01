const express = require("express");
const {
  createProduct,
  getProduct,
  deleteProduct,
  updateProduct,
  getProductPagination,
  getMyProducts,
  getProductsPage,
  getSomeProduct,
  getSubscriptionProduct,
  getAllNewestProducts,
} = require("../controllers/productController");
const protect = require("../middleware/authMiddleware");
const { upload } = require("../utils/fileUpload");

const router = express.Router();

router.get("/:id", protect, getProduct);
router.get("/:limit/:page", protect, getMyProducts);
router.get("/:id/:limit/:page", protect, getProductsPage);
router.get("/search/:limit/:page/:key", protect, getProductPagination);
router.get("/product/all/:limit/:page", protect, getAllNewestProducts);
router.post("/", protect, upload.single("image"), createProduct);
router.post("/getsomeproduct", protect, getSomeProduct);
router.post(
  "/getsubscriptionproduct/:limit/:page",
  protect,
  getSubscriptionProduct
);
router.patch("/:id", protect, upload.single("image"), updateProduct);
router.delete("/:id", protect, deleteProduct);

module.exports = router;
