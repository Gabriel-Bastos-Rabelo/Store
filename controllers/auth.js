const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.getLogin = (req, res, next) => {
    
    const errorMessage = req.flash('error');

    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        isLoggedIn: false,
        errorMessage: errorMessage

      });
}

exports.postLogin = (req, res, next) => {

    const email = req.body.email
    const password = req.body.password

    User.findAll({where: {email: email}}).then(user => {
        console.log(user)
        if(user[0]){
            bcrypt.compare(password, user[0].password).then(doMatch => {
                if (doMatch) {
                    req.session.user = user[0];
                    req.session.isLoggedIn = true;
                    req.session.save(err => {
                        console.log(err);
                        res.redirect("/");
                    });
                } else {
        
                    req.flash('error', 'Invalid password');

                    return req.session.save(err => {
                        res.redirect('/login');
                    });
                }
            });
        }
        else{
            req.flash('error', 'Invalid email');
            
            return req.session.save(err => {
                res.redirect('/login');
            });
        }
    }).catch(err => {
        console.log(err)
    })
    
    
    
  }


exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect("/");
    })
}


exports.getSignup = (req, res, next) => {
    const errorMessage = req.flash('error')[0];
    res.render('auth/signup', {
        pageTitle: 'Signup',
        path: '/signup',
        isLoggedIn: false,
        errorMessage: errorMessage
        
      });
}

exports.postSignup = (req, res, next) => {
    const name = req.body.name
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    User.findAll({where: {email: email}}).then(user => {
        if(user[0]){
            req.flash('error', 'Email already exists');
    
            return req.session.save(err => {
                res.redirect('/signup');
            });
        }

        else{
            bcrypt.hash(password, 12).then((hash) => {
                User.create({name: name, email: email, password: hash }).then(user => {
                    user.createCart();
            
                    return req.session.save(err => {
                        res.redirect('/signup');
                    });
                })
            })
            
        }
    }).catch(err => console.log(err))
}




