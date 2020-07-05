const mongoose = require('mongoose');
const slugify = require('slugify');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'A post must have a title'],
        unique: true
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
    createdAt: {
        type: Date,
        default: new Date
    },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String
    }
});

postSchema.pre('save', function (next) {
    this.slug = slugify(this.title, { lower: true });
    next();
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;