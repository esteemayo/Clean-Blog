const multer = require('multer');
const cloudinary = require('cloudinary');
const Post = require('../models/Post');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const storage = multer.diskStorage({
    filename: function (req, file, callback) {
        return callback(null, Date.now() + file.originalname);
    }
});

const imageFilter = function (req, file, cb) {
    // Accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
}

cloudinary.config({
    cloud_name: 'learntocodewithnode',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({ storage: storage, fileFilter: imageFilter });

exports.uploadPostImage = upload.single('image');

exports.getPostIndex = catchAsync(async (req, res, next) => {
    const posts = await Post
        .find()
        .sort({ createdAt: 'desc' })
        .limit(5);

    res.status(200).render('posts/index', {
        title: 'Posts',
        posts
    });
});

exports.getMorePosts = catchAsync(async (req, res, next) => {
    const posts = await Post.find().sort({ created: 'asc' });

    res.status(200).render('posts/more', {
        title: 'More posts',
        posts
    });
});

exports.createPost = catchAsync(async (req, res, next) => {
    const { title, description, content } = req.body;

    const result = await cloudinary.uploader.upload(req.file.path);
    const post = await Post.create({
        title,
        description,
        content,
        image: result.secure_url,
        imageId: result.public_id,
        author: {
            id: req.user._id,
            username: req.user.username
        }
    });

    req.flash('success', 'Post created!');
    res.status(201).redirect('/posts');
});

exports.newPost = (req, res) => {
    res.status(200).render('posts/create', {
        title: 'Add a new post'
    });
};