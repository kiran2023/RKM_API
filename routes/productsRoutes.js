
const express = require('express');
const productsController = require('../controllers/productsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/').get(productsController.getAllProducts).post(productsController.addProduct);
router.route('/highToLow').get(productsController.priceFilterHighToLow,productsController.getAllProducts);
router.route('/LowToHigh').get(productsController.priceFilterLowToHigh,productsController.getAllProducts)
router.route('/:id').get(productsController.getSpecificProduct).patch(productsController.patchProductData).delete(authController.userVerification, authController.roleAuthorization('admin'), productsController.deleteProduct);

router.route('/category/:category').get(productsController.categoryFiltration);

module.exports = router;