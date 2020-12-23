const express = require('express');
const authController = require('../controller/authController');
const viewController = require('../controller/viewController');
const imageController = require('../controller/imageController');

const router = express.Router();

router.get('/about', viewController.about);

router.get('/posts',
    authController.protect,
    viewController.getOverview
);

router.get('/posts/more',
    authController.protect,
    viewController.getMorePosts
);

router.get('/posts/more/page/:page',
    authController.protect,
    viewController.getMorePosts
);

router.get('/posts/new',
    authController.protect,
    viewController.newPost
);

router.post('/posts/store',
    authController.protect,
    imageController.uploadPostImage,
    viewController.createPost
);

router.get('/posts/:slug',
    authController.protect,
    viewController.post
);

router.get('/posts/:slug/edit',
    authController.protect,
    viewController.editPost
);

router.put('/posts/:id',
    authController.protect,
    imageController.uploadPostImage,
    viewController.updatePost
);

router.delete('/posts/:id',
    authController.protect,
    viewController.deletePost
);

module.exports = router;