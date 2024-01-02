const express = require("express");

const router = express.Router();
const shopController = require("../controllers/shop")

router.get("/", shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get("/products/:id", shopController.getProduct);

router.get("/cart", shopController.getCart);

router.post("/cart", shopController.addCart);

router.post("/cart-delete-item", shopController.postDeleteProductCart)

router.get("/orders", shopController.getOrders);

router.get("/checkout", shopController.getCheckout);

router.get("/product")

router.post("/create-order", shopController.postOrder);

module.exports = router;