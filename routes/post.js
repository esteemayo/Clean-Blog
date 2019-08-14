const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        return callback(null, Date.now() + file.originalname);
    }
});

const imageFilter = function (req, file, cb) {
    // ACCEPT IMAGE FILES ONLY
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
}

const upload = multer({ storage: storage, fileFilter: imageFilter });

const cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'learnhowtocode',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

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
        let posts = await Post.find({}).sort({ createdAt: 'desc' }).exec();
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
router.post('/posts/store', ensureAuthenticated, upload.single('image'), (req, res) => {
    cloudinary.uploader.upload(req.file.path, (result) => {
        let title = req.body.title;
        let description = req.body.description;
        let content = req.body.content;
        let image = result.secure_url;
        let imageId = result.public_url;
        let author = {
            id: req.user._id,
            username: req.user.username
        }

        const newPost = { title: title, description: description, content: content, image: image, imageId: imageId, author: author };

        Post.create(newPost, (err, posts) => {
            if (err) {
                console.log(err);
            } else {
                req.flash('success', 'Post created!');
                res.redirect('/');
            }
        });
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
            res.render('post', { posts: foundPost });
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
            res.render('edit', { post: foundPost });
        }
    });
});

// UPDATE BLOG POST ROUTE
router.put('/posts/:id', upload.single('image'), (req, res) => {
    Post.findById(req.params.id, async (err, post) => {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('back');
        } else {
            if (req.file) {
                try {
                    await cloudinary.uploader.destroy(post.imageId);
                    let result = await cloudinary.v2.uploader.upload(req.file.path);
                    post.imageId = result.public_url;
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
            req.flash('success', 'Post Successfully Updated!');
            res.redirect('/');
        }
    });
});

router.delete('/posts/:id', checkPostOwnership, ensureAuthenticated, (req, res) => {
    Post.findById(req.params.id, async (err, post) => {
        try {
            await cloudinary.uploader.destroy(post.imageId);
            post.remove();
            req.flash('success', 'Post Deleted Successfully!');
            res.redirect('/');
        } catch (err) {
            req.flash('error', err.message);
            return res.redirect('back');
        }
    });
});


module.exports = router;