const util = require("util");
const token = require("jsonwebtoken");
const crypto = require("crypto");

const userSignupSchema = require("../models/userSignup");
const customError = require("../utils/customError");
const emailSender = require("../utils/email");

const tokenGeneration = (userId) => {
  return token.sign(
    { id: userId, email: userRegistration.email },
    process.env.SECRET_TOKEN_STR,
    {
      expiresIn: process.env.USER_SESSION_TIMEOUT,
    }
  );
};

const storeToken = () => {
  let options = {
    expires: new Date(
      Date.now() + process.env.USER_SESSION_TIMEOUT * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  return options;
};

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((element) => {
    if (allowedFields.includes(element)) {
      newObj[element] = obj[element];
    }
  });
  return newObj;
};

const userRegistration = async (request, response) => {
  try {
    const userRegistration = await userSignupSchema.create(request.body);
    userRegistration.password = undefined;
    let userJwtToken = tokenGeneration(userRegistration._id);

    let options = storeToken(userJwtToken);
    response.cookie("jwt", userJwtToken, options);

    response.status(201).json({
      status: "success",
      userInfo: {
        userRegistration,
      },
    });
  } catch (error) {
    response.status(404).json({
      status: "fail",
      message: `Error - ${error}`,
    });
  }
};

const fetchRegisteredUsers = async (request, response) => {
  try {
    const userRegistration = await userSignupSchema.find(request.query);
    response.status(201).json({
      status: "success",
      userInfo: {
        userRegistration,
      },
    });
  } catch (error) {
    response.status(404).json({
      status: "fail",
      message: `Error - ${error}`,
    });
  }
};

const login = async (request, response, next) => {
  try {
    const { email, password } = request.body;

    if (!email || !password) {
      const error = new customError(
        "Please fill up the Mail-ID and Password",
        400
      );
      return next(error);
    }

    const userInformation = await userSignupSchema
      .findOne({ email: email })
      .select("+password");

    const passwordVerification = await userInformation.passwordVerification(
      password,
      userInformation.password
    );
    userInformation.password = undefined;

    if (!userInformation || !passwordVerification) {
      const error = new customError("Invalid User Mail or Password", 400);
      return next(error);
    }

    const userJwtToken = tokenGeneration(userInformation._id);
    let options = storeToken(userJwtToken);
    response.cookie("jwt", userJwtToken, options);
    response.status(200).json({
      status: "success",
      token: userJwtToken,
      userInfo: {
        userInformation,
      },
    });
  } catch (error) {
    response.status(404).json({
      status: "fail",
      message: `Error - ${error}`,
    });
  }
};

const userVerification = async function (request, response, next) {
  try {
    const headerAuthorization = request.headers.authorization;
    let tokenInformation;
    if (headerAuthorization && headerAuthorization.startsWith("Bearer")) {
      tokenInformation = headerAuthorization.split(" ")[1];
    }

    if (!tokenInformation) {
      next(new customError("You Are Not Logged in. Login to Access", 401));
    }

    const encodedToken = await util.promisify(token.verify)(
      tokenInformation,
      process.env.SECRET_TOKEN_STR
    );

    const userExist = await userSignupSchema.findById(encodedToken.id);

    if (!userExist) {
      next(new customError("User Does Not Exist", 401));
    }

    const userAuthenticated = await userExist.isPasswordChanged(
      encodedToken.iat
    );

    if (userAuthenticated) {
      next(new customError("Password Changed. Re-Login Again", 401));
    }
    request.userInfo = userExist;
    next();
  } catch (error) {
    response.status(404).json({
      status: "fail",
      message: `Error - ${error}`,
    });
  }
};

const roleAuthorization = (...role) => {
  return (request, response, next) => {
    if (!role.includes(request.userInfo.role)) {
      next(new customError("Unauthorized Access Denied", 403));
    }
    next();
  };
};

const forgotPassword = async (request, response, next) => {
  let user = await userSignupSchema.findOne({ email: request.body.email });

  if (!user) {
    next(
      new customError(
        `provided mail does not exist. Mail-Id : ${request.body.email} `
      )
    );
  }
  const tokenGenerated = await user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${request.protocol}://${request.get(
    "host"
  )}/api/v1/resetPassword/${tokenGenerated}`;
  const message = `Hi ${user.userName}.\n\nWe have received a mail for your password reset to your account.Please follow the below link to reset your password.\n\n${resetPasswordUrl}\n\nPLEASE IGNORE IF YOU HAVEN'T REQUESTED.\n\nThank You.\nRK MART`;

  try {
    await emailSender.mailSender({
      mail: user.email,
      subject: "Password Reset Request - RK MART",
      message: message,
    });
    response.status(200).json({
      message: "Success",
      Status: "Mail Sent Successfully",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    const result = new customError(
      "Error While Sending Mail. Please Check Back Later",
      500
    );
    return next(result);
  }
};

const resetPassword = async (request, response, next) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(request.params.token)
      .digest("hex");
    const user = await userSignupSchema.findOne({
      passwordResetToken: resetPasswordToken,
      passwordResetTokenExpires: { $gt: Date.now() },
    });
    if (!user) {
      const error = new customError(
        "Reset Password Timeout. Request Again",
        400
      );
      return next(error);
    }

    user.password = request.body.password;
    user.confirmPassword = request.body.confirmPassword;

    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.passwordChangedAt = Date.now();
    const userJwtToken = tokenGeneration(user._id);
    let options = storeToken(userJwtToken);
    response.cookie("jwt", userJwtToken, options);
    user
      .save()
      .then(() => {
        response.status(200).json({
          status: "success",
          message: "Password Changed Successfully",
          token,
        });
      })
      .catch((error) => {
        response.status(400).json({
          status: "fail",
          message: "Failed to reset your password try again later.",
        });
      });
  } catch (error) {
    response.status(404).json({
      status: "fail",
      message: `Error - ${error}`,
    });
  }
};

const updatePassword = async (request, response, next) => {
  try {
    const user = await userSignupSchema
      .findById(request.userInfo.id)
      .select("+password");
    const passwordVerification = await user.passwordVerification(
      request.body.currentPassword,
      user.password
    );
    console.log(passwordVerification);

    if (!passwordVerification) {
      const error = new customError("Invalid Current Password", 401);
      return next(error);
    }
    user.password = request.body.newPassword;
    user.confirmPassword = request.body.confirmPassword;

    await user
      .save()
      .then(() => {
        const userJwtToken = tokenGeneration(user.id);
        let options = storeToken(userJwtToken);
        response.cookie("jwt", userJwtToken, options);

        response.status(200).json({
          status: "success",
          message: "Password Changed Successfully",
          token: userJwtToken,
        });
      })
      .catch((error) => {
        response.status(400).json({
          status: "fail",
          message: `Failed to reset your password try again later. ${error.message}`,
        });
      });
  } catch (error) {
    response.status(404).json({
      status: "fail",
      message: `Error - ${error}`,
    });
  }
};

const updateUser = async (request, response, next) => {
  try {
    
    if (request.body.password || request.body.confirmPassword) {
      return next(
        new customError("You cannot update password at this endpoint", 400)
      );
    }

    const filteredBody = filterObj(
      request.body,
      "userName",
      "email",
      "mobileNumber"
    );

    const user = await userSignupSchema.findByIdAndUpdate(
      request.userInfo.id,
      filteredBody,
      { runValidators: true }
    );
                                           
    response.status(200).json({
      status: "success",
      message: "User Updated Successfully",
    });
    
  } catch (error) {
    response.status(404).json({
      status: "fail",
      message: `Failed to update user details - ${error.message}`,
    });
  }
};

module.exports = {
  userRegistration,
  fetchRegisteredUsers,
  login,
  userVerification,
  roleAuthorization,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateUser
};
