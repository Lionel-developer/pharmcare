
const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth.middleware');

const orderController = require('../controllers/order.controller');
router.post('/', authenticate, orderController.placeOrder);

module.exports = router;