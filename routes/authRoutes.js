const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.route('/signup').get(authController.userVerification, authController.fetchRegisteredUsers).post(authController.userVerification, authController.userRegistration);
router.route('/login').post(authController.userVerification, authController.login);

router.route('/forgotPassword').post(authController.userVerification, authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.userVerification,authController.resetPassword);

module.exports = router;
