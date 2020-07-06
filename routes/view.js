const express = require('express');
const authController = require('../controller/authController');
const viewController = require('../controller/viewController');

const router = express.Router();

router.get('/about', viewController.about);

router.get(
    '/posts',
    authController.protect,
    viewController.getPostIndex
);

router.get(
    '/posts/more',
    authController.protect,
    viewController.getMorePosts
);

router.get(
    '/posts/new',
    authController.protect,
    viewController.newPost
);

router.post(
    '/posts/store',
    authController.protect,
    viewController.uploadPostImage,
    viewController.createPost
);

router.get(
    '/posts/:slug',
    authController.protect,
    viewController.post
);

router.get(
    '/posts/:slug/edit',
    authController.protect,
    viewController.editPost
);

router.put(
    '/posts/:slug',
    authController.protect,
    viewController.updatePost
);

router.delete(
    '/posts/:slug',
    authController.protect,
    viewController.deletePost
);

module.exports = router;