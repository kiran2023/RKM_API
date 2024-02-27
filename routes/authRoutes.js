const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.route('/signup').get(authController.userVerification, authController.roleAuthorization, authController.fetchRegisteredUsers).post(authController.userRegistration);
router.route('/login').post(authController.login);

router.route('/forgotPassword').post(authController.userVerification, authController.roleAuthorization, authController.forgotPassword);
router.route('/updatePassword').patch(authController.userVerification, authController.updatePassword);
router.route('/updateUser').patch(authController.userVerification, authController.updateUser);
router.route('/resetPassword/:token').patch(authController.userVerification, authController.roleAuthorization, authController.resetPassword);

module.exports = router;
