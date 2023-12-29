const fs = require("fs");
const path = require("path");

const p = path.join(path.dirname(require.main.filename), "data", "cart.json");

module.exports = class Cart{
    static addProduct(id, priceProduct){
        fs.readFile(p, (err, contentFile) => {
            let cart = {products: [], totalPrice: 0}
            if(!err){
                cart = JSON.parse(contentFile);
            }

            
            const existingProductIndex = cart.products.findIndex(product => product.id == id)
            const existingProduct = cart.products[existingProductIndex]
            let updatedProducted;
            if(existingProduct){
                updatedProducted = {...existingProduct};
                updatedProducted.qty = updatedProducted.qty + 1
                cart.products = [...cart.products];
                cart.products[existingProductIndex] = updatedProducted;
            }
            else{
                updatedProducted = {id: id, qty: 1};
                cart.products = [...cart.products, updatedProducted];
            }

            cart.totalPrice = cart.totalPrice + priceProduct;

            fs.writeFile(p, JSON.stringify(cart), (err) => {
                console.log(err);
            });
            })

    

    }

    static delete(id, productPrice){
        fs.readFile(p, (err, fileContent) => {
            if(err){
                return
            }
            let updatedCart = {...JSON.parse(fileContent)};
            const product = updatedCart.products.find(prod => prod.id == id)
            if(product){
                const productQty = product.qty;
                const updatedProducts = updatedCart.products.filter(prod => prod.id != id);
                updatedCart.products = updatedProducts
                updatedCart.totalPrice -= parseFloat(productPrice) * productQty;

                fs.writeFile(p, JSON.stringify(updatedCart), (err) => {
                    console.log(err);
                });

            }
            

        })
    }

    static getCart(cb) {
        fs.readFile(p, (err, fileContent) => {
            if(err){
                cb(null)
            }
            else{
                cb(JSON.parse(fileContent))
            }
        })
    }
}