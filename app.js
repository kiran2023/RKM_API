const express = require('express');
const app = express();

const cors = require('cors');

var corsOptions = {
    origin: 'http://localhost:4200',
    methods: 'GET, POST, PUT, PATCH, DELETE, HEAD',
    credentials: true,
}
app.use(cors(corsOptions));

app.use(express.json()); 
app.use((request, response, next) => {
    request.time = new Date().toISOString();
    next();
});

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
    next(error);
});

app.use(errorController);

module.exports = app;