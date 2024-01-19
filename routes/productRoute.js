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
  getMyProductPagination,
} = require("../controllers/productController");
const protect = require("../middleware/authMiddleware");
const { upload } = require("../utils/fileUpload");

const router = express.Router();

router.get("/:id", getProduct);
router.get("/:limit/:page", protect, getMyProducts);
router.get("/:id/:limit/:page", getProductsPage);
router.get("/search/:limit/:page/:key", getProductPagination);
router.get(
  "/searchmyproduct/:limit/:page/:key",
  protect,
  getMyProductPagination
);
router.get("/product/all/:limit/:page", getAllNewestProducts);
router.post("/", protect, upload.single("image"), createProduct);
router.post("/getsomeproduct", protect, getSomeProduct);
router.post(
  "/getsubscriptionproduct/:limit/:page",
  protect,
  getSubscriptionProduct
);
router.post("/:id", protect, upload.single("image"), updateProduct);
router.delete("/:id", protect, deleteProduct);

module.exports = router;
