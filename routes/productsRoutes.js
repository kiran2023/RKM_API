
const express = require('express');
const productsController = require('../controllers/productsController');
const authController = require('../controllers/authController');

const router = express.Router();

//!  Database

router.route('/').get(productsController.getAllProducts).post(authController.userVerification, authController.roleAuthorization, productsController.addProduct);
router.route('/highToLow').get(productsController.priceFilterHighToLow, productsController.getAllProducts);
router.route('/LowToHigh').get(productsController.priceFilterLowToHigh, productsController.getAllProducts)
router.route('/:id').get(productsController.getSpecificProduct).patch(authController.userVerification, authController.roleAuthorization, productsController.patchProductData).delete(authController.userVerification, authController.roleAuthorization, productsController.deleteProduct);

router.route('/category/:category').get(productsController.categoryFiltration);

module.exports = router;