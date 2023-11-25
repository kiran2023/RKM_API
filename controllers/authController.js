const mongoose = require('mongoose');
const util = require('util');
const token = require('jsonwebtoken');
const crypto = require('crypto');

const userSignupSchema = require('../models/userSignup');
const customError = require('../utils/customError');
const emailSender = require('../utils/email');

const {request, response} = require("express");

const tokenGeneration = (userId) => {
    return token.sign({ id: userId, email: userRegistration.email }, process.env.SECRET_TOKEN_STR,{
        expiresIn: process.env.USER_SESSION_TIMEOUT
    } );
}

const userRegistration = async(request, response) =>{
    try{
        const userRegistration = await userSignupSchema.create(request.body);

        let userJwtToken = tokenGeneration(userRegistration._id);

        response.status(201).json({
            status: "success",
            userJwtToken,
            userInfo: {
                userRegistration
            }
        });
    }catch (error) {
        response.status(404).json({
            status: "fail",
            message: `Error - ${error}`
        });
    }
}

const fetchRegisteredUsers = async(request, response) =>{
    try{
        const userRegistration = await userSignupSchema.find(request.query);
        console.log(request.query);
        response.status(201).json({
            status: "success",
            userInfo: {
                userRegistration
            }
        });
    }catch (error) {
        response.status(404).json({
            status: "fail",
            message: `Error - ${error}`
        });
    }
}

const login = async (request, response, next) => {
    try{
        const {email, password} = request.body;

        if(!email || !password){
            const error = new customError("Please fill up the Mail-ID and Password", 400);
            return next(error);
        }

        const userInformation = await userSignupSchema.findOne({email: email}).select('+password');

        const passwordVerification = await userInformation.passwordVerification(password, userInformation.password);

        if(!userInformation || !passwordVerification){
            const error = new customError("Invalid User Mail or Password", 400);
            return next(error);
        }
        const userToken = tokenGeneration(userInformation._id);
        response.status(200).json({
            status: "success",
            userJwtToken: userToken,
            userInfo: {
                userRegistration
            }
        });    
    }catch (error) {
        response.status(404).json({
            status: "fail",
            message: `Error - ${error}`
        });
    }
}

const userVerification = async function(request, response, next){
    try{
        const headerAuthorization = request.headers.authorization;
        let tokenInformation;
        if(headerAuthorization && headerAuthorization.startsWith('Bearer')){
            tokenInformation = headerAuthorization.split(' ')[1];
        }

        if(!tokenInformation){
            next(new customError("You Are Not Loggedin. Login to Access", 401));
        }

        //? verification
        const encodedToken = await util.promisify(token.verify)(tokenInformation, process.env.SECRET_TOKEN_STR);

        const userExist = await userSignupSchema.findById(encodedToken.id);

        if(!userExist){
            next(new customError("User Does Not Exist", 401));
        }

        const userAuthenticated = await userExist.isPasswordChanged(encodedToken.iat);

        if(userAuthenticated){
            next(new customError("Password Changed. Re-Login Again", 401));
        }
        request.userInfo = userExist;
        next();
    }catch(error){
        response.status(404).json({
            status: "fail",
            message: `Error - ${error}`
        });
    }
}

const roleAuthorization = (...role) => {
    return (request, response, next) => {
        if(!role.includes(request.userInfo.role)){
            next(new customError("Unauthorized Access Denied", 403));
        }
        next();
    }
}

const forgotPassword = async (request, response, next) => {
    let user = await userSignupSchema.findOne({email: request.body.email});

    if(!user){
        next(new customError(`provided mail does not exist. Mail-Id : ${request.body.email} `))
    }
    const tokenGenerated = await user.createPasswordResetToken();
    await user.save({validateBeforeSave: false});

    const resetPasswordUrl = `${request.protocol}://${request.get('host')}/api/v1/resetPassword/${tokenGenerated}`;
    const message = `Hi ${user.userName}.\n\nWe have recieved a mail for your password reset to your account.Please follow the below link to reset your password.\n\n${resetPasswordUrl}\n\nPLEASE IGNORE IF YOU HAVEN'T REQUESTED.\n\nThank You.\nRK MART`;

    try{
        await emailSender.mailSender({
            mail: user.email,
            subject: 'Password Reset Request - RK MART',
            message: message
        });
        response.status(200).json({
            message:'Success',
            Status: 'Mail Sent Successfully'
        });
    }catch(error){
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpires = undefined;
        await user.save({validateBeforeSave: false});

        const result = new customError("Error While Sending Mail. Please Check Back Later", 500);
        return next(result);
    }
}

const resetPassword = async (request, response, next) => {
    try{
        const resetPasswordToken = crypto.createHash('sha256').update(request.params.token).digest('hex');
        const user = await userSignupSchema.findOne({passwordResetToken: resetPasswordToken, passwordResetTokenExpires: {$gt: Date.now()}});
        if(!user){
            const error = new customError("Reset Password Timeout. Request Again", 400);
            return next(error);
        }

        user.password = request.body.password;
        user.confirmPassword = request.body.confirmPassword;

        user.passwordResetToken = undefined;
        user.passwordResetTokenExpires = undefined;
        user.passwordChangedAt = Date.now();
        const token = tokenGeneration(user._id);

        user.save().then(() => {
            response.status(200).json({
                status: 'success',
                message: 'Password Changed Successfully',
                token
            });
        }).catch((error)=>{
            response.status(400).json({
                status: 'fail',
                message: `Failed to reset your password try again later. Error - ${error}`
            });
        })
    }catch (error){
        response.status(400).json({
            status: 'fail',
            message: 'Failed to reset your password try again later.'
        });
    }
}

module.exports = { userRegistration, fetchRegisteredUsers, login, userVerification, roleAuthorization, forgotPassword, resetPassword }