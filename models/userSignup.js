const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSignup = new mongoose.Schema({
    userName: {
        minLength: [5, "Please Enter Atleast 5 Letters User Name"],
        maxLength: [12, "User Name Should not Exceed More Than 12 Letters"],
        match: [/^(?!.*([A-Za-z])\1\1\1)[A-Za-z ]*$/, "Consecutive 4 Same Characters Not Allowed. Enter Only Alphabets"],
        required: [true, "Required Field"],
        type: String,
        lowercase: true
    },
    email: {
        match: [/^[0-9a-zA-Z]+(?:[.]{0,1}[0-9a-zA-Z])?[@][a-zA-Z]+[.][a-zA-Z]{2,3}([.][a-zA-Z]{2,3}){0,1}$/, "Enter Valid Mail ID"],
        required: [true, "Required Field"],
        type: String,
        unique: true
    },
    mobileNumber: {
        validate: {
            validator: function (value) {
                return /^[6-9]{1}[0-9]{9}$/.test(value.toString()); // Custom validation for 10-digit mobile number
            },
            message: "Mobile Number should start between 6 to 9 and should be 10 digits long."
        },
        required: [true, "Required Field"],
        type: Number,
        unique: true
    },
    password: {
        validate: {
            validator: function (value) {
                return /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{7,}$/.test(value);
            },
            message: "Password must contain at least one uppercase, one lowercase, one digit, one special character, and be at least 7 characters long."
        },
        required: [true, "Required Field"],
        type: String,
    },
    confirmPassword: {
        validate: {
            validator: function (value) {
                return value === this.password
            },
            message: "Password and Confirm Password Doesn't Matched"
        },
        required: [true, "Required Field"],
        type: String
    },
    role:{
      type: String,
      enum:{
          values: ['user'],
          message:"Role - {VALUE} is not available for selection"
      },
      default: 'user',
      required: true
    },
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
    passwordChangedAt: Date
});

userSignup.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);  //?hash is async
    this.confirmPassword = undefined;

    next();
});

userSignup.methods.passwordVerification = async function (userPassword, userRegisteredPassword) {
    return await bcrypt.compare(userPassword, userRegisteredPassword);
}

userSignup.methods.isPasswordChanged = async function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const passwordChangeTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < passwordChangeTimestamp
    }
    return false
}

userSignup.methods.createPasswordResetToken = async function(){
    const randomToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(randomToken).digest('hex');
    this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

    return randomToken;
}

module.exports = mongoose.model('registeredUsers', userSignup);
