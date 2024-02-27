const express = require('express');
const app = express();
const productsRouter = require('./routes/productsRoutes');
const authRouter = require('./routes/authRoutes')
const customError = require('./utils/customError');
const errorController = require('./controllers/errorController');
const cors = require('cors');

<<<<<<< HEAD
const cors = require('cors');

var corsOptions = {
    origin: 'http://localhost:4200',
    methods: 'GET, POST, PUT, PATCH, DELETE, HEAD',
    credentials: true,
}
app.use(cors(corsOptions));

app.use(express.json()); 
=======
var corsOptions = {
    origin: 'https://rkmapi-production.up.railway.app/',
    methods: 'GET, POST, PUT, PATCH, DELETE',
    credentials: true,
}
app.use(cors(corsOptions));

app.use(express.json()); 

>>>>>>> d56f9fcbdec7009b2ce11a20f7b670e6cb7c5e3f
app.use((request, response, next) => {
    request.time = new Date().toISOString();
    next();
});

<<<<<<< HEAD
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
    const error = new customError(`Page Not Found for the Requested URL ${request.url}`, 404);  //? Global Error Handling
=======
app.use('/', productsRouter);
app.use('/api/v1', authRouter);

app.all("*", (request, response, next)=>{
    const error = new customError(`Page Not Found for the Requested URL ${request.url}`, 404);
>>>>>>> d56f9fcbdec7009b2ce11a20f7b670e6cb7c5e3f
    next(error);
});

app.use(errorController);

<<<<<<< HEAD
module.exports = app;
=======
module.exports = app;
>>>>>>> d56f9fcbdec7009b2ce11a20f7b670e6cb7c5e3f
