const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

<<<<<<< HEAD
router.route('/signup').get(authController.userVerification, authController.roleAuthorization, authController.fetchRegisteredUsers).post(authController.userRegistration);
router.route('/login').post(authController.login);

router.route('/forgotPassword').post(authController.userVerification, authController.roleAuthorization, authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.userVerification, authController.roleAuthorization, authController.resetPassword);
=======
router.route('/signup').get(authController.userVerification, authController.fetchRegisteredUsers).post(authController.userVerification, authController.userRegistration);
router.route('/login').post(authController.userVerification, authController.login);

router.route('/forgotPassword').post(authController.userVerification, authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.userVerification,authController.resetPassword);
>>>>>>> d56f9fcbdec7009b2ce11a20f7b670e6cb7c5e3f

module.exports = router;
