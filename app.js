const express = require('express');
const app = express();
const productsRouter = require('./routes/productsRoutes');
const authRouter = require('./routes/authRoutes')
const customError = require('./utils/customError');
const errorController = require('./controllers/errorController');
const cors = require('cors');

var corsOptions = {
    origin: 'https://rk-mart-api-production.up.railway.app/',
    methods: 'GET, POST, PUT, PATCH, DELETE',
    credentials: true,
}
app.use(cors(corsOptions));

app.use(express.json()); 

app.use((request, response, next) => {
    request.time = new Date().toISOString();
    next();
});

app.use('/', productsRouter);
app.use('/api/v1', authRouter);

app.all("*", (request, response, next)=>{
    const error = new customError(`Page Not Found for the Requested URL ${request.url}`, 404);
    next(error);
});

app.use(errorController);

module.exports = app;
