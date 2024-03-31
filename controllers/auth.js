const User = require('../models/user')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const Sequelize = require('sequelize')
const { validationResult } = require('express-validator')

require('dotenv').config()

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_USER_PASS
  }
})

exports.getLogin = (req, res, next) => {
  const errorMessage = req.flash('error')

  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    isLoggedIn: false,
    errorMessage,
    oldInput: { email: '', password: '' }

  })
}

exports.postLogin = (req, res, next) => {
  const email = req.body.email
  const password = req.body.password
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      pageTitle: 'Login',
      path: '/login',
      isLoggedIn: false,
      errorMessage: errors.array()[0].msg,
      oldInput: { email, password }

    })
  } else {
    User.findAll({ where: { email } }).then(user => {
      req.session.user = user[0]
      req.session.isLoggedIn = true
      req.session.save(err => {
        console.log(err)
        res.redirect('/')
      })
    }).catch(err => {
      const error = err
      error.httpStatusCode = 500
      return next(error)
    })
  }
}

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err)
    res.redirect('/')
  })
}

exports.getSignup = (req, res, next) => {
  const errorMessage = req.flash('error')[0]
  res.render('auth/signup', {
    pageTitle: 'Signup',
    path: '/signup',
    isLoggedIn: false,
    errorMessage,
    oldInput: { name: '', email: '', password: '' }

  })
}

exports.postSignup = (req, res, next) => {
  const name = req.body.name
  const email = req.body.email
  const password = req.body.password
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      pageTitle: 'Signup',
      path: '/signup',
      isLoggedIn: false,
      errorMessage: errors.array()[0].msg,
      oldInput: { name, email, password }

    })
  }

  bcrypt.hash(password, 12).then((hash) => {
    User.create({ name, email, password: hash }).then(user => {
      user.createCart()

      return req.session.save(() => {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Hello from Nodemailer',
          text: 'This is a test email sent using Nodemailer.'
        }

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error sending email: ', error)
          } else {
            console.log('Email sent: ', info.response)
          }

          res.redirect('/login')
        })
      })
    })
  }).catch(err => {
    const error = err
    error.httpStatusCode = 500
    return next(error)
  })
}

exports.getReset = (req, res, next) => {
  const errorMessage = req.flash('error')
  res.render('auth/reset', {
    pageTitle: 'Reset Password',
    path: '/reset',
    isLoggedIn: false,
    errorMessage

  })
}

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      return res.redirect('/reset')
    }

    const token = buffer.toString('hex')

    User.findOne({ where: { email: req.body.email } }).then(user => {
      if (!user) {
        req.flash('error', 'No account with that email found')

        return res.redirect('/reset')
      }

      user.resetToken = token
      user.resetTokenExpiration = Date.now() + 3600000
      return user.save()
    }
    )
      .then(result => {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: req.body.email,
          subject: 'Hello from Nodemailer',
          html: `<p>You requested a password reset</p>
                       <p>Click this <a href = "http://localhost:3000/reset/${token}">link</a> to set a new password`
        }

        transporter.sendMail(mailOptions, (error, info) => {
          res.redirect('/')
          if (error) {
            console.error('Error sending email: ', error)
          } else {
            console.log('Email sent: ', info.response)
          }
        })
      }).catch(err => {
        const error = err
        error.httpStatusCode = 500
        return next(error)
      })
  })
}

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token
  const now = new Date()
  User.findOne({
    where: {
      resetToken: token,
      resetTokenExpiration: {
        [Sequelize.Op.gt]: now
      }
    }
  })
    .then(user => {
      if (!user) {
        return res.redirect('/token-expired')
      } else {
        const errorMessage = req.flash('error')
        res.render('auth/new-password', {
          pageTitle: 'New Password',
          path: '/newPassword',
          isLoggedIn: false,
          errorMessage,
          userId: user.id

        })
      }
    }).catch(err => {
      const error = err
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.getTokenExpired = (req, res, next) => {
  console.log('chegou aqui')
  return res.render('auth/token-expired', {
    pageTitle: 'Token Expired',
    path: '/token-expired',
    isLoggedIn: false
  })
}

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password
  const userId = req.body.userId

  User.findOne({ where: { id: userId } })
    .then(user => {
      if (!user) {
        console.log('User not found.')
      }

      return bcrypt.hash(newPassword, 12)
        .then(hashedPassword => {
          return user.update({
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiration: null
          })
        })
        .then(result => {
          res.redirect('/login')
        })
    })
    .catch(err => {
      const error = err
      error.httpStatusCode = 500
      return next(error)
    })
}
