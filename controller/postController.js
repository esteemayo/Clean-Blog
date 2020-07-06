const multer = require('multer');
const cloudinary = require('cloudinary');

const Post = require('../models/Post');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('../controller/handlerFactory');

const multerStorage = multer.diskStorage({
    filename: function (req, file, cb) {
        return cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const multerFilter = function (req, file, cb) {
    // Accept image files only
    if (file.mimetype.startsWith('image')) {
        return cb(null, true);
    }
    cb(new AppError('Not an image! Please upload only images', 400), false);
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

cloudinary.config({
    cloud_name: 'learntocodewithnode',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.uploadPostImage = upload.single('image');

exports.getAllPosts = factory.getAll(Post);

exports.getPost = factory.getOne(Post);

exports.createPost = catchAsync(async (req, res, next) => {
    const { title, description, content } = req.body;

    const result = await cloudinary.uploader.upload(req.file.path);
    const post = await Post.create({
        title,
        description,
        content,
        image: result.secure_id,
        imageId: result.public_id,
        author: {
            id: req.user._id,
            username: req.user.username
        }
    });

    res.status(201).json({
        status: 'success',
        data: {
            post
        }
    });
});

exports.updatePost = catchAsync(async (req, res, next) => {
    const { title, description, content } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
        return next(new AppError('No post found with the given ID', 404));
    }

    if (req.file) {
        await cloudinary.v2.uploader.destroy(post.imageId);
        const result = await cloudinary.v2.uploader.upload(req.file.path);
        post.imageId = result.public_id;
        post.image = result.secure_id;
    }

    post.title = title;
    post.description = description;
    post.content = content;
    await post.save();

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

    await cloudinary.v2.uploader.destroy(post.imageId);
    post.remove();

    res.status(204).json({
        status: 'success',
        data: null
    });
});