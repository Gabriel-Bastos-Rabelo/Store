const User = require("../models/user");

exports.getLogin = (req, res, next) => {
    console.log(req.session.isLoggedIn)
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        isLoggedIn: false,
      });
}

exports.postLogin = (req, res, next) => {

    User.findByPk(1).then(user => {

        
        req.session.user = user;
        req.session.isLoggedIn = true;

        console.log(req.session.user)

        res.redirect("/");
    }).catch(err => console.log(err))

    
    
    
  }

