const Post = require('../models/Post');
const catchAsync = require('../utils/catchAsync');

exports.ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();

    req.flash('error', 'Oops you must be logged in to do that!');
    res.redirect('/auth/login');
}

exports.checkPostOwnership = catchAsync(async (req, res, next) => {
    if (req.isAuthenticated()) {
        const post = await Post.findById(req.params.id);

        if (post.author.equals(req.user._id)) return next();

        req.flash('error', 'You do not have permission to perform this action.');
        return res.redirect('/posts');
    }
    req.flash('error', 'Oops you must be logged in to do that!');
    res.redirect('/posts');
});