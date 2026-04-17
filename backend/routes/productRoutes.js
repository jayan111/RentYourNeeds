const express = require("express");
const productController = require("../controllers/productController");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Update the product creation route to use the upload middleware
router.post("/admin/products", upload.array("images", 5), productController.createProduct);

router.get("/products", productController.getProducts);
router.get("/customer/products", productController.getCustomerProducts);

module.exports = router;