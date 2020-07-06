const express = require('express');
const postController = require('../controller/postController');

const router = express.Router();

router
    .route('/')
    .get(postController.getAllPosts)
    .post(
        postController.uploadPostImage,
        postController.createPost
    );

router
    .route('/:id')
    .get(postController.getPost)
    .patch(
        postController.uploadPostImage,
        postController.updatePost
    )
    .delete(postController.deletePost);

module.exports = router;