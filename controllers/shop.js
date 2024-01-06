const Product = require('../models/product');
const Cart = require("../models/cart");
const Order = require("../models/order")
const User = require("../models/user")

exports.getProducts = (req, res, next) => {

  Product.findAll().then(data => {
    

    res.render('shop/product-list', {
      prods: data,
      pageTitle: 'All Products',
      path: '/products',
      isLoggedIn: req.session.isLoggedIn,

    });
  }).catch(err => console.log(err))

  
};

exports.getProduct = (req, res, next) => {
  const id = req.params.id;
  Product.findByPk(id).then(data => {

    res.render("shop/product-details", {product: data, pageTitle: "Product details", path: "/product-details", isLoggedIn: req.session.isLoggedIn, csrfToken: req.csrfToken()})
  }).catch(err => console.log(err))
  
}

exports.getIndex = async (req, res, next) => {
  
  
  Product.findAll().then(data => {
    
    res.render('shop/index', {
      prods: data,
      pageTitle: 'Shop',
      path: '/',
      isLoggedIn: req.session.isLoggedIn,

    });
  }).catch(err => console.log(err))
  
  
};

exports.getCart = (req, res, next) => {
  console.log("chegou auqi")
  const userId = req.session.user.id;
  console.log(req.session.user)
  User.findByPk(userId)
  .then(user => {
    return user.getCart();
  })
  .then(cart => {
    return cart.getProducts()
    .then(product => {
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: product,
        isLoggedIn: req.session.isLoggedIn,
        
      })
    .catch(err => console.log(err))
    })
  })

  .catch(err => console.log(err))
  
};

exports.getOrders = (req, res, next) => {
  const userId = req.session.user.id;
  User.findByPk(userId).then(user => {
    return user.getOrders({include: ['products']})
  })
  .then(orders => {
    console.log(orders)
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Cart',
      orders: orders,
      isLoggedIn: req.session.isLoggedIn,
      
    });
  }).catch(err => console.log(err))
  
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};


exports.addCart = (req, res, next) => {
  const id = req.body.productId;
  let fetchedCart;
  let newQuantity = 1
  const userId = req.session.user.id;
  User.findByPk(userId).then(user => {
    return user.getCart();
  })
  .then(cart => {
    fetchedCart = cart;
    return cart.getProducts({where:{id: id}})
  })
  .then(prod => {
    let product;
    if(prod.length > 0){
      product = prod[0];
    }
    if(product){
      console.log(product.getCartItem)
      oldQuantity = product.cartItem.quantity;
      newQuantity = oldQuantity + 1;

      return product;
    }

    return Product.findByPk(id);
  

  })
  .then(product => {
    fetchedCart.addProduct(product, {through: {quantity: newQuantity}});
    res.redirect("/cart");
  })
  .catch(err => console.log(err))
}

exports.postDeleteProductCart = (req, res, next) => {
  const id = req.body.productId;
  const userId = req.session.user.id;
  User.findByPk(userId).then(user => {
    return user.getCart();
  })
  .then(cart => {
    return cart.getProducts({where: {id: id}});
  }).then(product => {
    return product[0].cartItem.destroy();
  }).then(result => {
    res.redirect("/cart");
  }).catch(err => console.log(err))

  
}


exports.postOrder = (req, res, next) => {
  let fetchedCart;
  let fetchedUser;
  const userId = req.session.user.id;

  User.findByPk(userId)
    .then(user => {
      fetchedUser = user;
      return user.getCart();
    })
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then(products => {
      return fetchedUser.createOrder()
        .then(order => {
          return order.addProducts(products.map(product => {
            product.orderItem = { quantity: product.cartItem.quantity };
            return product;
          }));
        });
    })
    .then(() => {
      return fetchedCart.setProducts(null);
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch(err => {
      console.log(err);
    });
};
