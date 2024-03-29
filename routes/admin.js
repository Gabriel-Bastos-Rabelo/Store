const express = require("express");
const path = require("path")
const router = express.Router();
const rootDir = require("../util/path");
const adminController = require("../controllers/admin")

const isAuth = require("../middlewares/is-auth");
const products = []
const {postAddProductValidation, postEditProductValidation} = require("../middlewares/adminValidations")


router.get("/add-product", isAuth, adminController.getAddProduct);

router.post("/add-product", isAuth, postAddProductValidation(), adminController.postAddProduct)

router.get("/products", isAuth,  adminController.getProducts)


router.get("/edit-product/:id", isAuth, adminController.getEditProduct);

router.post("/edit-product", isAuth, postEditProductValidation(), adminController.postEditProduct);

router.delete("/product/:productId", isAuth, adminController.deleteProduct)

module.exports = router;

