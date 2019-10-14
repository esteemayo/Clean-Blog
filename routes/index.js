const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const { ensureAuthenticated } = require('../helpers/auth');


// USER PROFILE
router.get('/:userId', ensureAuthenticated, async (req, res) => {
    try {
        const posts = await Post.find({ user: req.params.userId }).populate('author');
        res.render('users/user', { posts });
    } catch (ex) {
        console.log(ex)
        req.flash('error', 'Something went wrong.');
        res.redirect('/posts')
    }
});

// router.get('/:id', ensureAuthenticated, (req, res) => {
//     User.findById(req.params.id, (err, user) => {
//         if (err) {
//             console.log(err);
//             req.flash('error', 'Something went wrong');
//             res.redirect('/');
//         } else {
//             Post.find().where('author.id').equals(user._id).exec((err, post) => {
//                 if (err) {
//                     console.log(err);
//                     req.flash('error', 'Something went wrong');
//                     res.redirect('/posts');
//                 } else {
//                     res.render('user', { user: user, posts: post });
//                 }
//             });
//         }
//     });
// });



module.exports = router;