
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ 
        status: 'OK',
        service: 'Pharmcare backend',
        time: new Date().toTimeString()
    });
})

module.exports = router;