const Product = require('../models/product');
const User = require("../models/user");

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    formsCSS: true,
    productCSS: true,
    activeAddProduct: true,
    editing: false,
    isLoggedIn: req.session.isLoggedIn,
    
    
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const price = req.body.price;
  const description = req.body.description;
  const imageUrl = req.body.image_url
  const userId = req.session.user.id;
  User.findByPk(userId).then(user => {
    return user.createProduct({
      title: title,
      price: price,
      imageUrl: imageUrl,
      description: description,
      
    })
  })
  .then(data => {
    res.redirect("/admin/products")})
  .catch(err => console.log(err))

};

exports.getProducts = (req, res, next) => {
  const userId = req.session.user.id;
  User.findByPk(userId).then(user => {
    return user.getProducts()
  })
  .then(data => {
    res.render('admin/products', {
      prods: data,
      pageTitle: 'Admin Products',
      path: '/admin/products',
      isLoggedIn: req.session.isLoggedIn,

    });
  }).catch(err => console.log(err))
 
};


exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;

  if(!editMode){
    res.redirect("/")
  }

  const id = req.params.id;

  const userId = req.session.user.id;

  User.findByPk(userId).then(user => {
    return user.getProducts({where: {id: id}})
  })
  .then(data => {
    
    if(!data){
      return res.redirect("/");
    }

    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      product: data[0],
      isLoggedIn: req.session.isLoggedIn

    })
  }).catch(err => console.log(err))
  

  
}


exports.postEditProduct = (req, res, next) => {

  const id = req.body.productId;
  const title = req.body.title;
  const image_url = req.body.image_url;
  const description = req.body.description;
  const price = req.body.price;


  Product.update({
    title: title,
    price: price,
    imageUrl: image_url,
    description: description

  }, {
    where:{
      id: id
    }
  }).then(() => {
    res.redirect("/admin/products");
  }).catch(err => console.log(err))

  
}

exports.postDeleteProduct = (req, res, next) => {

  const id = req.body.productId;
  Product.destroy({where: {
    id: id
  }}).then(() => {
    res.redirect("/admin/products");
  }).catch(err => console.log(err))
  

}