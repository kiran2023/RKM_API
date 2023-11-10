const customError = require("../utils/customError");
const devError = (error, response) => {
    response.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        stackTrace: error.stack,
        error: error
    });
}

const prodError = (error, response) => {
    if(error.isOperational){
        response.status(error.statusCode).json({
            status: error.status,
            message: error.message
        });
    }else{
        response.status(500).json({
            status: 'Internal Server Error',
            message: 'Something went wrong. Please check back again'
        });
    }
}

const castError = (error) => {
    return new customError(`Product with ID - ${error.value} does not exist.`, 404);
}

const duplicateError = (error) => {
    return new customError(`A product with the name : ${error.keyValue.productName} already exist.`, 400);
}

const validationError = (error) => {
    const errorMessages = Object.values(error.errors).map(errorData => `${errorData.path} - ${errorData.message}`);  //?error:{ errors: { nameError }, {passwordLengthError}, ... }
    const validationErrorMessages = errorMessages.join('. '); //? errorMessages is an array so join into a single error data
    return new customError(`Invalid Entered Data : ${validationErrorMessages}`, 400);
}

module.exports = ( error, request, response, next )=>{
    error.statusCode = error.statusCode || 500;
    error.status = error.status || "Fail";
    if(process.env.NODE_ENV==='development'){
        devError(error, response);
    }else if(process.env.NODE_ENV==='production'){
        if(error.name==='CastError'){
            error = castError(error);
        }else if(error.name==="ValidationError"){
            error = validationError(error);
        }
        prodError(error, response);
    }
}