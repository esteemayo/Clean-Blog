const express = require('express');
const contactController = require('../controller/contactController');

const router = express.Router();

router.get('/', contactController.getContactForm);

router.post('/', contactController.contact);



module.exports = router;