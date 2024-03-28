const Product = require('../models/product');
const Cart = require("../models/cart");
const Order = require("../models/order");
const orderItem = require("../models/order-item");
const User = require("../models/user");
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

exports.getProducts = (req, res, next) => {

  Product.findAll().then(data => {

    res.render('shop/product-list', {
      prods: data,
      pageTitle: 'All Products',
      path: '/products',
      isLoggedIn: req.session.isLoggedIn,

    });
  }).catch(err => {
    const error = err;
    error.httpStatusCode = 500;
    return next(error)
  })


};

exports.getProduct = (req, res, next) => {
  const id = req.params.id;
  Product.findByPk(id).then(data => {
    console.log(req)
    res.render("shop/product-details", { product: data, pageTitle: "Product details", path: "/product-details", isLoggedIn: req.session.isLoggedIn, csrfToken: req.csrfToken })
  }).catch(err => {
    const error = err;
    error.httpStatusCode = 500;
    return next(error)
  })

}

exports.getIndex = async (req, res, next) => {


  Product.findAll().then(data => {

    res.render('shop/index', {
      prods: data,
      pageTitle: 'Shop',
      path: '/',
      isLoggedIn: req.session.isLoggedIn,

    });
  }).catch(err => {
    const error = err;
    error.httpStatusCode = 500;
    return next(error)
  })


};

exports.getCart = (req, res, next) => {
  const userId = req.session.user.id;

  User.findByPk(userId)
    .then(user => user.getCart())
    .then(cart => cart.getProducts())
    .then(products => {
      console.log(products)
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products,
        isLoggedIn: req.session.isLoggedIn,
      });
    })
    .catch(err => {
      // Aqui você captura qualquer erro que ocorra em qualquer parte da cadeia de promessas
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


exports.getOrders = (req, res, next) => {
  const userId = req.session.user.id;
  User.findByPk(userId).then(user => {
    return user.getOrders({ include: ['products'] })
  })
    .then(orders => {


      return res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Cart',
        orders: orders,
        isLoggedIn: req.session.isLoggedIn,

      });
    }).catch(err => {
      const error = err;
      error.httpStatusCode = 500;
      return next(error)
    })

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
      return cart.getProducts({ where: { id: id } })
    })
    .then(prod => {
      let product;
      if (prod.length > 0) {
        product = prod[0];
      }
      if (product) {
        console.log(product.getCartItem)
        oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;

        return product;
      }

      return Product.findByPk(id);


    })
    .then(product => {
      fetchedCart.addProduct(product, { through: { quantity: newQuantity } });
      res.redirect("/cart");
    })
    .catch(err => {
      const error = err;
      error.httpStatusCode = 500;
      return next(error)
    })
}

exports.postDeleteProductCart = (req, res, next) => {
  const id = req.body.productId;
  const userId = req.session.user.id;
  User.findByPk(userId).then(user => {
    return user.getCart();
  })
    .then(cart => {
      return cart.getProducts({ where: { id: id } });
    }).then(product => {
      return product[0].cartItem.destroy();
    }).then(result => {
      res.redirect("/cart");
    }).catch(err => {
      const error = err;
      error.httpStatusCode = 500;
      return next(error)
    })


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
      const error = err;
      error.httpStatusCode = 500;
      return next(error)
    })
};


exports.getInvoices = (req, res, next) => {
  const id = req.params.id;
  Order.findByPk(id, { include: ['products'] }).then(order => {
    if (!order) {
      return next(new Error('Order not found'));
    }

    if (order.userId !== req.session.user.id) {
      return next(new Error('Not authorized'));
    }

    const invoiceName = "invoice-" + id + ".pdf";
    const invoicePath = path.join('data', 'invoices', invoiceName);

    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(invoicePath);

    doc.fontSize(26).text('Invoice', {
      underline: true
    }).moveDown();

    doc.fontSize(20).text(`Order ID: ${id}`, {
      align: 'left'
    }).moveDown(2);

    let totalPrice = 0;
    order.products.forEach(prod => {
      const productTotal = prod.orderItem.quantity * prod.price;
      totalPrice += productTotal;
      doc.fontSize(14).text(`${prod.title} - ${prod.orderItem.quantity} x $${prod.price.toFixed(2)} = $${productTotal.toFixed(2)}`, {
        align: 'left'
      }).moveDown(0.5);
    });

    // Adicionando uma linha antes do total
    doc.moveDown().fontSize(14).text('-----------------------').moveDown(0.5);

    // Adicionando o total
    doc.fontSize(16).text(`Total Price: $${totalPrice.toFixed(2)}`, {
      align: 'right',
      bold: true
    });

    doc.pipe(writeStream);

    doc.on('error', (err) => {
      next(err);
    });

    writeStream.on('finish', () => {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
      const file = fs.createReadStream(invoicePath);
      file.pipe(res);
    });

    doc.end();
    
  }).catch(err => {
    console.log(err);
    next(err);
  });
}
