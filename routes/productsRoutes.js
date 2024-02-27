
const express = require('express');
const productsController = require('../controllers/productsController');
const authController = require('../controllers/authController');

const router = express.Router();

<<<<<<< HEAD
//!  Database

router.route('/').get(productsController.getAllProducts).post(authController.userVerification, authController.roleAuthorization, productsController.addProduct);
router.route('/highToLow').get(productsController.priceFilterHighToLow, productsController.getAllProducts);
router.route('/LowToHigh').get(productsController.priceFilterLowToHigh, productsController.getAllProducts)
router.route('/:id').get(productsController.getSpecificProduct).patch(authController.userVerification, authController.roleAuthorization, productsController.patchProductData).delete(authController.userVerification, authController.roleAuthorization, productsController.deleteProduct);
=======
router.route('/').get(productsController.getAllProducts).post(productsController.addProduct);
router.route('/highToLow').get(productsController.priceFilterHighToLow,productsController.getAllProducts);
router.route('/LowToHigh').get(productsController.priceFilterLowToHigh,productsController.getAllProducts)
router.route('/:id').get(productsController.getSpecificProduct).patch(productsController.patchProductData).delete(authController.userVerification, authController.roleAuthorization('admin'), productsController.deleteProduct);
>>>>>>> d56f9fcbdec7009b2ce11a20f7b670e6cb7c5e3f

router.route('/category/:category').get(productsController.categoryFiltration);

module.exports = router;