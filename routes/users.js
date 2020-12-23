const express = require('express');
const authController = require('../controller/authController');
const userController = require('../controller/userController');

const router = express.Router();

router
    .route('/users/register',)
    .get(authController.registerForm)
    .post(authController.register);

router
    .route('/users/verify-account')
    .get(authController.verifyForm)
    .post(authController.verify);

router
    .route('/auth/login')
    .get(authController.loginForm)
    .post(authController.login);

router.get('/auth/logout', authController.logout);

router
    .route('/auth/forgot')
    .get(authController.forgotForm)
    .post(authController.forgot);

router
    .route('/auth/reset/:token')
    .get(authController.resetPasswordForm)
    .post(authController.resetPassword);

router.get('/account/me',
    authController.protect,
    authController.account
);

router.post('/submit-user-data',
    authController.protect,
    authController.updateUserData
);

router.post('/update-password',
    authController.protect,
    authController.confirmPassword,
    authController.updatePassword
);

router.get('/users/profile/:username',
    authController.protect,
    authController.profile
);

router.get('/users/profile/:username/page/:page',
    authController.protect,
    authController.profile
);

router
    .route('/api/v1/users')
    .get(userController.getAllUsers)
    .post(userController.createUser);

router
    .route('/api/v1/users/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;