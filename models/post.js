const mongoose = require('mongoose');
const slugify = require('slugify');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'A post must have a title'],
        maxlength: [50, 'A campground name must have less or equal than 50 characters'],
        minlength: [10, 'A campground name must have more or equal than 10 characters']
    },
    description: {
        type: String,
        required: [true, 'A post must have a description']
    },
    content: {
        type: String,
        required: [true, 'A post must have a content']
    },
    slug: String,
    image: String,
    imageId: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'A post must belong to an author']
        },
        username: String
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
});

// Performance index
postSchema.index({ title: 1, slug: 1 });

// Document middleware
postSchema.pre('save', async function (next) {
    if (!this.isModified('title')) return next();

    this.slug = slugify(this.title, { lower: true });

    const slugRegExp = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    const postWithSlug = await this.constructor.find({ slug: slugRegExp });

    if (postWithSlug.length) {
        this.slug = `${this.slug}-${postWithSlug.length + 1}`;
    }

    next();
});

// Document middleware
postSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'username'
    });

    next();
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;