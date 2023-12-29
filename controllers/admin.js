const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    formsCSS: true,
    productCSS: true,
    activeAddProduct: true,
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const product = new Product(null, req.body.title, req.body.image_url, req.body.description, req.body.price);
  product.save();
  res.redirect('/');
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    });
  });
};


exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;

  if(!editMode){
    res.redirect("/")
  }

  const id = req.params.id;
  Product.findById(id, product => {
    
    if(!product){
      return res.redirect("/");
    }

    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      product: product[0]

    })
  })

  
}


exports.postEditProduct = (req, res, next) => {

  const id = req.body.productId;
  const title = req.body.title;
  const image_url = req.body.image_url;
  const description = req.body.description;
  const price = req.body.price;


  const editProduct = new Product(id, title, image_url, description, price);
  editProduct.save();

  res.redirect("/admin/products")
}

exports.postDeleteProduct = (req, res, next) => {

  const id = req.body.productId;
  Product.delete(id);
  res.redirect("/admin/products");

}