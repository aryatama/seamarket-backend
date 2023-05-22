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
} = require("../controllers/productController");
const protect = require("../middleware/authMiddleware");
const { upload } = require("../utils/fileUpload");

const router = express.Router();

router.post("/", protect, upload.single("image"), createProduct);
router.patch("/:id", protect, upload.single("image"), updateProduct);
router.get("/:limit/:page", protect, getMyProducts);
router.get("/:id/:limit/:page", protect, getProductsPage);
router.get("/:id", protect, getProduct);
router.delete("/:id", protect, deleteProduct);
router.get("/search/:limit/:page/:key", protect, getProductPagination);
router.post("/getsomeproduct", protect, getSomeProduct);
router.post("/getsubscriptionproduct/:limit/:page", protect, getSubscriptionProduct);

module.exports = router;
