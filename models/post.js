const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'A post must have a title']
    },
    description: {
        type: String,
        required: [true, 'A post must have a description']
    },
    content: {
        type: String,
        required: [true, 'A post must have a content']
    },
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

const Post = mongoose.model('Post', postSchema);

module.exports = Post;