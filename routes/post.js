const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Post = require('../models/post');
const { ensureAuthenticated, checkPostOwnership } = require('../helpers/auth');

// INDEX ROUTE
// router.get('/', ensureAuthenticated, (req, res) => {
//     Post.find({}).sort({createdAt: 'desc'}).exec((err, posts) => {
//         if (err) {
//             console.log(err);
//         } else {
//             res.render('index', {posts: posts});
//         }
//     });
// });

router.get('/', ensureAuthenticated, async (req, res) => {
    try {
        let posts = await Post.find({}).sort({createdAt: 'desc'}).exec();
        res.render('index', { posts });
    } catch (err) {
        console.log(err);
    }
});

// ABOUT ROUTE
router.get('/about', (req, res) => {
    res.render('about');
});

// CONTACT ROUTE
router.get('/contact', (req, res) => {
    res.render('contact');
});

// CONTACT-PAGE POST LOGIC WITH NODEMAILER
router.post('/contact', (req, res) => {
    let smtpTransporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'esteemdesign19@gmail.com',
            pass: 'princeadebayo'
        }
    });

    let mailOptions = {
        from: req.body.name + '&lt;' + req.body.telephone + '&gt;',
        to: 'esteemdesign19@gmail.com',
        subject: `${req.body.email} says: ${req.body.message}`
    }

    smtpTransporter.sendMail(mailOptions, (err, data) => {
        if (err) {
            req.flash('error', err.message);
            res.redirect('/contact');
        } else {
            req.flash('success', 'Message successfully sent');
            res.redirect('/');
        }
    });
});

// NEW POST ROUTE
router.get('/posts/new', ensureAuthenticated, (req, res) => {
    res.render('create');
});

// CREATE NEW POST ROUTE
router.post('/posts/store', ensureAuthenticated, (req, res) => {
    let title = req.body.title;
    let description = req.body.description;
    let content = req.body.content;
    let image =req.body.image;
    let author = {
        id: req.user._id,
        username: req.user.username
    }

    let newPost = { title: title, description: description, content: content, image: image, author: author };
    Post.create(newPost, (err, newlyCreatedPost) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
});

// router.post('/posts/store', (req, res) => {
//     const {image} = req.files;

//     image.mv(path.resolve(__dirname, 'public/posts', image.name), err => {
//         Post.create({
//             ...req.body,
//             image: `/posts/${image.name}`
//         }, (err, post) => {
//             res.redirect('/');
//         });
//     });
// });

// SHOW POST ROUTE
router.get('/posts/:id', ensureAuthenticated, (req, res) => {
    Post.findById(req.params.id, (err, foundPost) => {
        if (err) {
            console.log(err);
        } else {
            res.render('post', {posts: foundPost});
        }
    });
});

// EDIT POST ROUTE
router.get('/posts/:id/edit', checkPostOwnership, ensureAuthenticated, (req, res) => {
    Post.findById(req.params.id, (err, foundPost) => {
        if (err) {
            console.log(err);
            res.redirect('/');
        } else {
            res.render('edit', {post: foundPost});
        }
    });
});

// UPDATE BLOG POST ROUTE
router.put('/posts/:id', checkPostOwnership, ensureAuthenticated, (req, res) => {
    Post.findByIdAndUpdate(req.params.id, req.body.post, (err, updatedPost) => {
        if (err) {
            res.redirect('/');
        } else {
            req.flash('success', 'Blog post updated');
            res.redirect('/posts/' + req.params.id);
        }
    });
});

router.delete('/posts/:id', checkPostOwnership, ensureAuthenticated, (req, res) => {
    Post.findByIdAndDelete(req.params.id, err => {
        if (err) {
            console.log(err);
            res.redirect('/');
        } else {
            req.flash('success', 'Blog post deleted');
            res.redirect('/');
        }
    });
});


module.exports = router;