const express = require('express');
const router = express.Router();

// LOGOUT ROUTE
router.get('/', (req, res) => {
    req.logout();
    req.flash('success', 'Logged you out');
    res.redirect('/auth/login');
});

module.exports = router;