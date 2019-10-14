const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { ensureAuthenticated, checkPostOwnership } = require('../helpers/auth');
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



// INDEX ROUTE
router.get('/', ensureAuthenticated, async (req, res) => {
    try {
        const posts = await Post.find({})
            .sort('-createdAt')
            .limit(5)
        res.render('posts/index', { posts });
    } catch (ex) {
        console.log(ex);
    }
});

// MORE-POST GET ROUTE
router.get('/more', ensureAuthenticated, async (req, res) => {
    try {
        const posts = await Post.find({})
            .sort('-createdAt')
        res.render('posts/more', { posts });
    } catch (ex) {
        console.log(ex);
        res.redirect('/posts');
    }
});

// NEW POST ROUTE
router.get('/new', ensureAuthenticated, (req, res) => {
    res.render('posts/create');
});

// CREATE NEW POST ROUTE
router.post('/store', ensureAuthenticated, upload.single('image'), (req, res) => {
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
                res.redirect('/posts');
            }
        });
    });
});

// SHOW POST ROUTE
router.get('/:id', ensureAuthenticated, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.render('posts/show', { post })
    } catch (err) {
        console.log(ex);
    }
});

// EDIT POST ROUTE
router.get('/:id/edit', checkPostOwnership, ensureAuthenticated, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.render('posts/edit', { post });
    } catch (ex) {
        console.log(ex);
        res.redirect('/posts');
    }
});

// UPDATE BLOG POST ROUTE
router.put('/:id', upload.single('image'), (req, res) => {
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
            res.redirect('/posts');
        }
    });
});

router.delete('/:id', checkPostOwnership, ensureAuthenticated, (req, res) => {
    Post.findById(req.params.id, async (err, post) => {
        try {
            await cloudinary.uploader.destroy(post.imageId);
            post.remove();
            req.flash('success', 'Post Deleted Successfully!');
            res.redirect('/posts');
        } catch (err) {
            req.flash('error', err.message);
            return res.redirect('back');
        }
    });
});


module.exports = router;