const Post = require('../models/Post');

module.exports = {
    ensureAuthenticated: (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error', 'Not Authorized');
        res.redirect('/auth/login');
    },

    checkPostOwnership: (req, res, next) => {
        if (req.isAuthenticated()) {
            Post.findById(req.params.id, (err, post) => {
                if (err) {
                    console.log(err);
                } else {
                    if (post.author.id.equals(req.user._id)) {
                        next();
                    } else {
                        req.flash('error', 'Not Authorized');
                        res.redirect('/');
                    }
                }
            });
        } else {
            req.flash('error', 'Not Authorized');
            res.redirect('/');
        }
    }
}