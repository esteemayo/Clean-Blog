const express = require('express');
const contactController = require('../controller/contactController');

const router = express.Router();

router
    .route('/')
    .get(contactController.getContactForm)
    .post(contactController.contact);

module.exports = router;