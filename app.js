const express = require('express');
const app = express();

//? Method Chaining --> status and response sending in same line
//? Routing --> HTTP Method (get,post etc..) + URL

//? get
// app.get('/', (request, response) => response.status(200).send("From ExpressJs Okay"));

//? post
//* app.post('/', (request, response) => response.status(200).send("From ExpressJs Okay") );

//? Json Response -->Instead of Send Used Json
//* app.get('/', (request, response) => response.status(200).json({productsName:'Apple', price:149}) );


//? ----------------------------------------------------

//! Middleware 
//? It is called on each request made to the server if the route middle ware send a response back then the middleware after that will not be executed.
//? It executes in the written sequence.
app.use(express.json()); //Middelware is used inorder to attach request body to the request object to an request while post the products

//! Custom Middleware
//? It is called on each request made to the server if the route middle ware send a response back then the middleware after that will not be executed.
//? It executes in the written sequence.
//? If something has sended response back to the request middleware wint be called written below that.
app.use((request, response, next) => {
    request.time = new Date().toISOString();
    next();
});

//? ----------------------------------------------------

//! API Request - GET 
// const fs = require('fs');
// const productUrl = './Datas/products.json';
// let products = JSON.parse(fs.readFileSync('./Datas/products.json'));

const productsRouter = require('./routes/productsRoutes');
const path = require("path");
const fs = require("fs");

const authRouter = require('./routes/authRoutes')

const customError = require('./utils/customError');
const errorController = require('./controllers/errorController');

app.use('/', express.static(path.join(__dirname,'./public/mainPage')));
app.use('/products', express.static(path.join(__dirname,'./public/products/')));

app.use('/api/v1/products', productsRouter);

app.use('/api/v1', authRouter);


app.all("*", (request, response, next)=>{
    // response.status(404).json({
    //     Status: "Fail",
    //     Message: `Page Not Found for the Requested URL ${request.url}`
    // })
    // const error = new Error(`Page Not Found for the Requested URL ${request.url}`);  //? Global Error Handling
    // error.statusCode = 404;
    // error.status = "Fail";
    // next(error);

    const error = new customError(`Page Not Found for the Requested URL ${request.url}`, 404);  //? Global Error Handling
    next(error);
});

app.use(errorController);

// app.use('/products', (request, response, next) => {
//     const indexPath = path.join(__dirname, 'public/mainPage/index.html');
//     const productsPath = path.join(__dirname, 'public/products/product.html');
  
//     fs.access(productsPath, fs.constants.F_OK, (err) => {
//       if (!err) {
//         response.sendFile(productsPath);
//       } else {
//         response.sendFile(indexPath);
//         response.redirect('/');
//       }
//     });
// });

// app.get('/api/v1/products', getProducts);

//? ----------------------------------------------------

//! API Request - POST
// app.post('/api/v1/products', postProduct);

//! API Request - GET 
//? Route Parameter --> :id  --> Specific Product
// app.get('/api/v1/products/:id', getSpecificProduct);

//! API Request - PATCH
// app.patch('/api/v1/products/:id', patchProductData);

//! API Request - DELETE
// app.delete('/api/v1/products/:id', deleteProduct);

//? ----------------------------------------------------

//? Another way to route
// app.route('/api/v1/products').get("functionForGettingData").post("functionForPostingData");

//! Custom Middleware wont be called
//? as the route above defined or the above CRUD operations returned some response means response.end is called so below givven middleware wont called or executed
//* app.use((request, response, next)=>{
//*     console.log("Custom Middleware");
//*     next();
//* });


module.exports = app;