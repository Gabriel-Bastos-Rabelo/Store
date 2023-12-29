const Product = require('../models/product');
const Cart = require("../models/cart");

exports.getProducts = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });
  });
};

exports.getProduct = (req, res, next) => {
  const id = req.params.id;
  Product.findById(id, product => {
    console.log(product)
    res.render("shop/product-details", {product: product[0], pageTitle: "Product details", path: "/product-details"})
  })


}

exports.getIndex = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  });
};

exports.getCart = (req, res, next) => {

  Cart.getCart(cart => {
    
    Product.fetchAll(products => {
      
      const cartProducts = []
      console.log(cart)
      if(cart){
        for(const product of products){
          const findProductInCart = cart.products.filter(prod => prod.id == product.id);
          
          if(findProductInCart.length > 0){
            cartProducts.push({productData: product, qty: findProductInCart[0].qty });
          }
        }
      }
     

      
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: cartProducts
      });
    })
    
  })
  
};

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Cart'
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};


exports.addCart = (req, res, next) => {
  const id = req.body.productId;
  Product.findById(id, product => {
    Cart.addProduct(id, parseFloat(product[0].price))
  })
  res.redirect("/cart")
}

exports.postDeleteProductCart = (req, res, next) => {
  const id = req.body.productId;
  Product.findById(id, product => {
    Cart.delete(id, product[0].price);
    res.redirect("/cart");
  })

  
}