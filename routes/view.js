const express = require('express');
const viewController = require('../controller/viewController');

const router = express.Router();

router.get('/posts', viewController.getPostIndex);

router.get('/posts/more', viewController.getMorePosts);

router.get('/posts/new', viewController.newPost);

router.post('/posts/store', viewController.uploadPostImage, viewController.createPost);



module.exports = router;