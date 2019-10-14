const express = require('express');
const router = express.Router();


// ABOUT ROUTE
router.get('/', (req, res) => {
    res.render('about');
});



module.exports = router;