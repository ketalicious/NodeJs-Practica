const getDb = require('../util/mongodb').getDb;




class Product {
    constructor(title, imageUrl, price, description){
        
        this.title = title;
        this.imageUrl = imageUrl;
        this.price = price;
        this.description = description;
        
    }

    save() {
        const db = getDb();
        return db.collection('products')
        .insertOne(this)
        .then(result =>{
            console.log("Producto salvado");
        })
        .catch(err => {console.log(err)});
      
    }

    static fetchAll() {
        return db.
        collection('products')
        .find();
    }


}


// const fs = require('fs');
// const path = require('path');
// const Cart = require('./cart');


// const p = path.join(
//     path.dirname(process.mainModule.filename),
//     'data',
//     'products.json'
// );

// const getProductsFromFile = (cb) =>{
  
//     fs.readFile(p, (err, fileContent) => {
//             if (err){
//                 cb([]);
//             } else {
//                 cb(JSON.parse(fileContent));
//             }
//     })
// }


        // getProductsFromFile(products=>{
        //     if(this.id){
        //         const existingProdructIndex = products.findIndex(prod => prod.id === this.id);
        //         const updatedProducts = [...products];
        //         updatedProducts[existingProdructIndex] = this;
        //         fs.writeFile(p,JSON.stringify(updatedProducts),(err)=>{
        //             if (err){
        //             console.log("error en "+ err);
        //             }
        //         });
        //     }else{
        //         this.id = Math.floor((Math.random() * 100) + 1).toString();
        //         products.push(this);
        //         fs.writeFile(p,JSON.stringify(products),(err)=>{
        //         if (err){
        //         console.log("error en "+ err);
        //         }
        //     });
        //     }
            
        // });
  
    // static deleteById(id){
    //     getProductsFromFile(products => {
    //         const product = products.find(prod => prod.id === id);
    //         const updatedProducts = products.filter(prod => prod.id !== id );
    //         fs.writeFile(p,JSON.stringify(updatedProducts), err =>{
    //             if(!err){
    //                 Cart.deleteProduct(id, product.price);
    //             }
    //         })
    //     });
    // }


    // static fetchAll(cb) {
    //    getProductsFromFile(cb);
    // }

    // static findById(id,cb){
    //     getProductsFromFile(products => {
    //         const product = products.find(p => p.id === id );
    //         cb(product);
    //     });
    // }



module.exports = Product;