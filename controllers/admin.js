const Product = require('../models/product')
const User = require('../models/user')
const { validationResult } = require('express-validator')
const { deleteFile } = require('../util/file')

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    formsCSS: true,
    productCSS: true,
    activeAddProduct: true,
    editing: false,
    isLoggedIn: req.session.isLoggedIn,
    errorMessage: ''

  })
}

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title
  const price = req.body.price
  const description = req.body.description
  const image = req.file
  const userId = req.session.user.id
  const errors = validationResult(req)

  if (!image) {
    return res.render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      formsCSS: true,
      productCSS: true,
      activeAddProduct: true,
      editing: false,
      isLoggedIn: req.session.isLoggedIn,
      errorMessage: 'Attached file is not an image'

    })
  }

  if (!errors.isEmpty()) {
    return res.render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      formsCSS: true,
      productCSS: true,
      activeAddProduct: true,
      editing: false,
      isLoggedIn: req.session.isLoggedIn,
      errorMessage: errors.array()[0].msg

    })
  }

  User.findByPk(userId).then(user => {
    return user.createProduct({
      title,
      price,
      imageUrl: image.path,
      description

    })
  })
    .then(data => {
      res.redirect('/admin/products')
    })
    .catch(err => {
      const error = new Error('Creating a product failed', err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.getProducts = (req, res, next) => {
  const userId = req.session.user.id
  User.findByPk(userId).then(user => {
    return user.getProducts()
  })
    .then(data => {
      res.render('admin/products', {
        prods: data,
        pageTitle: 'Admin Products',
        path: '/admin/products',
        isLoggedIn: req.session.isLoggedIn

      })
    }).catch(err => {
      const error = new Error('get products failed', err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit

  if (!editMode) {
    res.redirect('/')
  }

  const id = req.params.id

  const userId = req.session.user.id

  User.findByPk(userId).then(user => {
    return user.getProducts({ where: { id } })
  })
    .then(data => {
      if (!data) {
        return res.redirect('/')
      }

      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: true,
        product: data[0],
        isLoggedIn: req.session.isLoggedIn,
        errorMessage: ''

      })
    }).catch(err => {
      const error = new Error('get edit product failed', err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.postEditProduct = async (req, res, next) => {
  const { productId: id, title, description, price } = req.body
  const image = req.file
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      isLoggedIn: req.session.isLoggedIn,
      product: { id, title, description, price },
      errorMessage: errors.array()[0].msg
    })
  }

  try {
    const product = await Product.findByPk(id)
    if (!product) {
      return next(new Error('Product not found'))
    }

    if (product.userId !== req.session.user.id) {
      return res.redirect('/')
    }

    if (image) {
      deleteFile(product.imageUrl)
      product.imageUrl = image.path
    }

    product.title = title
    product.price = price
    product.description = description

    await product.save()
    res.redirect('/admin/products')
  } catch (err) {
    const error = new Error('Editing product failed')
    error.httpStatusCode = 500
    return next(error)
  }
}

exports.deleteProduct = (req, res, next) => {
  const id = req.params.productId
  const userId = req.session.user.id

  Product.findByPk(id).then(product => {
    if (!product) {
      return next(new Error('Product not found.'))
    }

    deleteFile(product.imageUrl)

    return Product.destroy({
      where: {
        id,
        userId
      }
    })
  })
    .then(() => {
      res.status(200).json({ message: 'Success!' })
    }).catch(err => {
      res.status(500).json({ message: 'Failed to delete product', error: err })
    })
}
