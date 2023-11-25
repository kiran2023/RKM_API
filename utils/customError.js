class customError extends Error {
    constructor(errorMessage, statusCode) {
        super(errorMessage); //? calls base/parent class constructor Sets error.message with the passed errorMessage
        this.statusCode = statusCode;
        this.status = statusCode>=400 && statusCode<500? "Fail" : "Internal Server Error";

        this.isOperational = true

        Error.captureStackTrace(this, this.constructor)
    }
}

module.exports = customError;