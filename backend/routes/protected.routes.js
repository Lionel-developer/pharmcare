

const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth.middleware');

router.get('/me', authenticate, (req, res) => {
    res.json({
        message: 'Access granted',
        user: req.user
    });
});

module.exports = router;