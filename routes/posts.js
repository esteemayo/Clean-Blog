const express = require('express');
const postController = require('../controller/postController');
const imageController = require('../controller/imageController');

const router = express.Router();

router
    .route('/')
    .get(postController.getAllPosts)
    .post(
        imageController.uploadPostImage,
        postController.createPost
    );

router
    .route('/:id')
    .get(postController.getPost)
    .patch(
        imageController.uploadPostImage,
        postController.updatePost
    )
    .delete(postController.deletePost);

module.exports = router;