const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.route('/signup').get(authController.userVerification, authController.fetchRegisteredUsers).post(authController.userRegistration);
router.route('/login').post(authController.login);

router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);

module.exports = router;