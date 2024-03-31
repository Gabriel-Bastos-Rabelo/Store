const express = require('express')

const router = express.Router()

const authController = require('../controllers/auth')

const { signUpValidation, loginValidation } = require('../middlewares/authValidations')

router.get('/login', authController.getLogin)

router.post('/login', loginValidation(), authController.postLogin)

router.post('/logout', authController.postLogout)

router.get('/signup', authController.getSignup)

router.post('/signup', signUpValidation(), authController.postSignup)

router.get('/reset', authController.getReset)

router.post('/reset', authController.postReset)

router.get('/reset/:token', authController.getNewPassword)

router.get('/token-expired', authController.getTokenExpired)

router.post('/new-password', authController.postNewPassword)

module.exports = router
