const express = require("express");
const path = require("path")
const router = express.Router();
const rootDir = require("../util/path");
const adminController = require("../controllers/admin")

const isAuth = require("../middlewares/is-auth");
const products = []


router.get("/add-product", isAuth, adminController.getAddProduct);

router.post("/add-product", isAuth, adminController.postAddProduct)

router.get("/products", isAuth,  adminController.getProducts)


router.get("/edit-product/:id", isAuth, adminController.getEditProduct);

router.post("/edit-product", isAuth, adminController.postEditProduct);

router.post("/delete-product", isAuth, adminController.postDeleteProduct)

module.exports = router;

