const express = require('express')

const router = express.Router()
const shopController = require('../controllers/shop')
const isAuth = require('../middlewares/is-auth')

router.get('/', shopController.getIndex)

router.get('/products', shopController.getProducts)

router.get('/products/:id', shopController.getProduct)

router.get('/cart', isAuth, shopController.getCart)

router.post('/cart', isAuth, shopController.addCart)

router.post('/cart-delete-item', isAuth, shopController.postDeleteProductCart)

router.get('/orders/:id', isAuth, shopController.getInvoices)

router.get('/orders', isAuth, shopController.getOrders)

router.get('/checkout', shopController.getCheckout)

router.get('/product')

router.post('/create-order', isAuth, shopController.postOrder)

module.exports = router
