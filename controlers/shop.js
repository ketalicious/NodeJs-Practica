const Product = require('../model/product');
const User = require('../model/user');
const Order = require('../model/order');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit')


const ITEMS_PER_PAGE = 6;

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find().countDocuments()
    .then(numProds => {
      totalItems = numProds;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    })
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page+1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems/ ITEMS_PER_PAGE)

        
      });
    })
    .catch(err => {
      console.log(err);
    });
};
exports.getProducts = (req, res, next) => {

  const page = +req.query.page || 1;
  let totalItems;

  Product.find().countDocuments()
    .then(numProds => {
      totalItems = numProds;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    })
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'Products',
        path: '/products',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page+1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems/ ITEMS_PER_PAGE)

        
      });
    })
    .catch(err => {
      console.log(err);
    });
}

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;


  Product.findById(prodId)
    .then(product => {
      
      User.findById(product.userId)
        .then(user => {
          res.render('shop/product-detail', {
            product: product,
            pageTitle: product.title,
            path: '/products',

          });
        }).catch(e => console.log(e));
    }).catch(err => console.log(err));
};


exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products,

      });
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      res.redirect('/products');
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .deleteItemFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        return {
          quantity: i.quantity,
          product: {
            ...i.productId._doc
          }
        };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  Order.find({
      'user.userId': req.user._id
    })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,

      });
    })
    .catch(err => console.log(err));
};


exports.getInvoice = (req, res, next) => {

  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then(order => {
      if (!order) {
        return next(new Error("No order"))
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("No Acces"))
      }

      const invoiceName = 'invoice-' + orderId + '.pdf';
      const invoicePath = path.join('data', invoiceName)

      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader(
        'Content-Disposition',
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);
      let totalCompras = 0;

      pdfDoc.fontSize(26).text('INVOICE:')
      pdfDoc.fontSize(26).text('--------------------------------------------------');
      order.products.forEach(prod => {
        totalCompras += prod.product.price * prod.quantity;
        pdfDoc
          .fontSize(14)
          .text(`
      Producto: ${prod.product.title}(${prod.product.price})
      Cantidad: ${prod.quantity} Total Producto: ${prod.quantity*prod.product.price}
      `);
      });
      pdfDoc.fontSize(14).text(`Total: ${totalCompras}`)


      pdfDoc.end();
      // const file = fs.createReadStream(invoicePath);
      // res.setHeader('Content-Type','application/pdf')
      // res.setHeader(
      //   'Content-Disposition',
      //   'attachment; filename="'+invoiceName+'"'
      // );

      // file.pipe(res);

      // fs.readFile(invoicePath, (err, data)=>{
      // if (err){
      //   return next(err);
      // }
      // res.setHeader('Content-Type','application/pdf')
      // res.setHeader('Content-Disposition','attachment; filename="'+invoiceName+'"')
      // res.send(data);

      // })

    })
    .catch(err => next(err))

}