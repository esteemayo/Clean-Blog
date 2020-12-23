const express = require('express');
const contactController = require('../controllers/contactController');

const router = express.Router();

router
    .route('/')
    .get(contactController.getContactForm)
    .post(contactController.contact);

module.exports = router;