const { body, check } =  require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

const signUpValidation = () => {
    
    return [
        check("email")
            .isEmail()
            .withMessage("Please, enter a valid email")
            .normalizeEmail()
            .custom(value => {
                return User.findAll({ where: { email: value } })
                    .then(user => {
                        if (user.length > 0) {
                            return Promise.reject();
                        }
                    });
            })
            .withMessage("E-mail already in use")
            .trim(),
  
        body('password')
            .exists({checkFalsy: true})
            .withMessage('You must type a password')
            .isLength({min: 5})
            .withMessage('The password must be at least 5 chars long')
            .isAlphanumeric()
            .withMessage("The password must contain only numbers and letters")
            .trim(),
        body("confirmPassword")
            .exists({checkFalsy: true})
            .withMessage('You must type a confirmation password')
            .custom((value, { req }) => {
                return value === req.body.password;
            })
            .withMessage("The passwords do not match")
            .trim()
    ];
}


const loginValidation = () => {
    return [
        check("email")
            .isEmail()
            .withMessage("Please, enter a valid email")
            .normalizeEmail()
            .trim()
            .custom(async (value) => {
                const user = await User.findAll({ where: { email: value } });
                if (user.length === 0) {
                    return Promise.reject("No account with this email");
                }
            }),

        body('password')
            .exists({ checkFalsy: true })
            .withMessage('You must type a password')
            .trim()
            .custom(async (value, { req }) => {
                
                const user = await User.findAll({ where: { email: req.body.email } });
                const doMatch = await bcrypt.compare(value, user[0].password);
                if (!doMatch) {
                    return Promise.reject("Invalid Password");
                }
            })
    ];
};



module.exports = {signUpValidation, loginValidation}