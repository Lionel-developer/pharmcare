
const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth.middleware');
const {
    addToCart,
    removeFromCart,
    getCart,
    checkout
} = require('../controllers/cart.controller');

router.use(authenticate);

router.post('/add', addToCart);
router.delete('/remove/:product_id', removeFromCart);
router.get('/', getCart);
router.post('/checkout', checkout);

module.exports = router;