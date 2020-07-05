const express = require('express');
const viewController = require('../controller/viewController');

const router = express.Router();

router.get('/about', viewController.about);

router.get('/posts', viewController.getPostIndex);

router.get('/posts/more', viewController.getMorePosts);

router.get('/posts/new', viewController.newPost);

router.post('/posts/store', viewController.uploadPostImage, viewController.createPost);

router.get('/posts/:slug', viewController.post);

router.get('/posts/:slug/edit', viewController.editPost);

router.put('/posts/:slug', viewController.updatePost);

router.delete('/posts/:slug', viewController.deletePost);

module.exports = router;