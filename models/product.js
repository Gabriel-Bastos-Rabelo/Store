const fs = require("fs");
const path = require("path");
const cart = require("./cart");
const p = path.join(path.dirname(require.main.filename), "data", "products.json");

const getProductsFromFile = (cb) => {
    
    fs.readFile(p, (err, fileContent) => {
        if(err){
            cb([]);
        }
        else{
            cb(JSON.parse(fileContent));
        }

    
    })
}

module.exports = class Product{
    
    constructor(id, title, image_url, description, price){
        this.id = id;
        this.title = title;
        this.image_url = image_url;
        this.description = description;
        this.price = price;
    }

    save(){
        
        getProductsFromFile((product) => {

            if(this.id){
    
                const indexProduct = product.findIndex(prod => prod.id == this.id);
                product[indexProduct] = this;
                fs.writeFile(p, JSON.stringify(product), (err) => {console.log(err)})
            }
            else{
                this.id = Math.random().toString();
                product.push(this);
                fs.writeFile(p, JSON.stringify(product), (err) => {console.log(err)})
            }
          
        })
        
    }

    static fetchAll(cb){
        getProductsFromFile(cb)
    }

    static findById(id, cb){
        getProductsFromFile(products => {
            const product = products.filter(p => p.id == id);
            cb(product);
        })
    }

    static delete(id){
        getProductsFromFile(products => {
            const product = products.filter(prod => prod.id == id);
            const updatedProducts = products.filter(prod => prod.id !== id)
        
            fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
                if(!err){
                    cart.delete(id, product[0].price);
                }
            })

        })
    }
}