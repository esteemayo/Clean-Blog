const express = require('express');
const authControlller = require('../controller/authController');

const router = express.Router();

router.get('/users/register', authControlller.registerForm);

router.post('/users/register', authControlller.register);

router.get('/auth/login', authControlller.loginForm);

router.post('/auth/login', authControlller.login);

router.get('/auth/logout', authControlller.logout);

router.get('/auth/forgot', authControlller.forgotForm);

router.post('/auth/forgot', authControlller.forgot);

router.get('/auth/reset/:token', authControlller.resetPasswordForm);

router.post('/auth/reset/:token', authControlller.resetPassword);

router.post('/api/v1/users', authControlller.apiLogin);

module.exports = router;