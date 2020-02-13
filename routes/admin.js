const path = require('path');

const express= require('express');

const adminController = require('../controlers/admin');

const router = express.Router();

const products = [];




//admin GET
router.get('/add-product', adminController.getAddProduct);
// router.get('/products',adminController.getProducts);


//admin POST
router.post('/add-product', adminController.postAddProduct);

// router.get('/edit-product/:productId',adminController.getEditProduct);
// router.post('/edit-product',adminController.postEditProduct);

// router.post('/delete-product',adminController.postDeleteProduct);



module.exports = router;
exports.products = products;