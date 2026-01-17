

const express = require('express');
const router = express.Router();
const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/product.controller');
const authenticate = require('../middlewares/auth.middleware');
const isAdmin = require('../middlewares/isAdmin.middleware');
//admin routes
router.post('/', authenticate, isAdmin, createProduct);
router.put('/:id', authenticate, isAdmin, updateProduct);
router.delete('/:id', authenticate, isAdmin, deleteProduct);

//public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

module.exports = router;