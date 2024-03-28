
const { body, check } =  require("express-validator");

const postAddProductValidation = () => {
    return [
        body("title")
            .trim()
            .notEmpty()
            .withMessage("The title must not be empty")
            ,
        
        body("price")
            .isNumeric()
            .withMessage('Only Decimals allowed'),

        body('description')
            .trim()
            .notEmpty()
            .withMessage("The description must not be empty")
        
    ]
}

const postEditProductValidation = () => {


    return [
        body("title")
            .trim()
            .notEmpty()
            .withMessage("The title must not be empty")
        ,
        
        body("price")
            .isNumeric()
            .withMessage('Only Decimals allowed'),

        body('description')
            .trim()
            .notEmpty()
            .withMessage("The description must not be empty")


    ]
}

module.exports = {postAddProductValidation, postEditProductValidation}