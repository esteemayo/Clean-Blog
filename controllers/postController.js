const cloudinary = require('cloudinary');
const Post = require('../models/Post');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('../controller/handlerFactory');

cloudinary.config({
    cloud_name: 'learntocodewithnode',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.getAllPosts = factory.getAll(Post);
exports.getPost = factory.getOne(Post);

exports.createPost = catchAsync(async (req, res, next) => {
    const result = await cloudinary.uploader.upload(req.file.path);

    req.body.image = result.secure_url;
    req.body.imageId = result.public_id;
    if (!req.body.author) req.body.author = { id: req.user._id, username: req.user.username };

    const post = await Post.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            post
        }
    });
});

exports.updatePost = catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
        return next(new AppError('No post found with the given ID', 404));
    }

    if (req.file) {
        try {
            await cloudinary.v2.uploader.destroy(post.imageId);
            const result = await cloudinary.v2.uploader.upload(req.file.path);
            post.imageId = result.public_id;
            post.image = result.secure_id;
        } catch (err) {
            console.log(err.message);
            return;
        }
    }
    post.title = req.body.title;
    post.description = req.body.description;
    post.content = req.body.content;
    post.save();

    res.status(200).json({
        status: 'success',
        data: {
            post
        }
    });
});

exports.deletePost = catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
        return next(new AppError('No post found with the given ID', 404));
    }

    await cloudinary.uploader.destroy(post.imageId);
    post.remove();

    res.status(204).json({
        status: 'success',
        data: null
    });
});