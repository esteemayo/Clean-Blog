const cloudinary = require('cloudinary');
const Post = require('../models/Post');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.getOverview = catchAsync(async (req, res, next) => {
    const posts = await Post
        .find()
        .sort('-createdAt')
        .limit(5);

    res.status(200).render('posts/index', {
        title: 'Overview',
        posts
    });
});

exports.getMorePosts = catchAsync(async (req, res, next) => {
    const page = req.params.page * 1 || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const postsPromise = Post
        .find()
        .skip(skip)
        .limit(limit)
        .sort('-createdAt');

    const countPromise = Post.countDocuments();

    const [posts, count] = await Promise.all([postsPromise, countPromise]);

    const pages = Math.ceil(count / limit);

    if (!posts.length && skip) {
        req.flash('info', `Hey! You asked for page ${page}. But that doesn't exist. So I put you on page ${pages}`);
        return res.redirect(`/posts/more/page/${pages}`);
    }

    res.status(200).render('posts/more', {
        title: 'More posts',
        count,
        posts,
        pages,
        page
    });
});

exports.createPost = catchAsync(async (req, res, next) => {
    const result = await cloudinary.uploader.upload(req.file.path);

    req.body.image = result.secure_url;
    req.body.imageId = result.public_id;
    if (!req.body.author) req.body.author = { id: req.user._id, username: req.user.username };

    await Post.create(req.body);

    req.flash('success', 'Post created!');
    res.redirect('/posts');
});

exports.post = catchAsync(async (req, res, next) => {
    const post = await Post.findOne({ 'slug': req.params.slug });

    if (!post) {
        return next(new AppError('No post found with the given slug', 404));
    }

    res.status(200).render('posts/show', {
        title: post.title,
        post
    });
});

exports.editPost = catchAsync(async (req, res, next) => {
    const post = await Post.findOne({ 'slug': req.params.slug });

    if (!post) {
        return next(new AppError('No post found with the given slug', 404));
    }

    res.status(200).render('posts/edit', {
        title: `Edit ${post.title}`,
        post
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
            post.image = result.secure_url;
        } catch (err) {
            req.flash('error', err.message);
            return res.redirect('back');
        }
    }
    post.title = req.body.title;
    post.description = req.body.description;
    post.content = req.body.content;
    post.save();

    req.flash('success', 'Post successfully updated!');
    res.redirect(`/posts/${post.slug}`);
});

exports.deletePost = catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
        return next(new AppError('No post found with the given ID', 404));
    }

    await cloudinary.uploader.destroy(post.imageId);
    post.remove();
    req.flash('success', 'Post deleted successfully!');
    res.redirect('/posts');
});

exports.newPost = (req, res) => {
    res.status(200).render('posts/create', {
        title: 'Create a new post'
    });
};

exports.about = (req, res) => {
    res.status(200).render('about', {
        title: 'About us'
    });
};