const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');

// Models
const Post = require('../../models/Post');
const User = require('../../models/User');

dotenv.config({ path: './config.env' });

// Database local
const db = process.env.MONGODB_URI;

// MongoDb connection
mongoose.connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
    .then(() => console.log(`Connected to MongoDB → ${db}`));

// Read JSON file
const posts = JSON.parse(fs.readFileSync(`${__dirname}/posts.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

// Import data into DB
const importData = async () => {
    try {
        await Post.insertMany(posts);
        await User.insertMany(users, { validateBeforeSave: false });

        console.log('Data Successfully Loaded💯👍👌✌👋');
        process.exit();
    } catch (err) {
        console.log(err);
        process.exit();
    }
};

// Delete all data from DB
const deleteData = async () => {
    try {
        console.log('😢😢 Goodbye Data...');

        await Post.deleteMany();
        await User.deleteMany();

        console.log('Data Deleted. To load sample data, run\n\n\t npm run sample\n\n');
        console.log('Data Successfully Deleted💯👍👌✌👋');
        process.exit();
    } catch (err) {
        console.log('\n👎👎👎👎👎👎👎👎 Error! The Error info is below but if you are importing sample data make sure to drop the existing database first with.\n\n\t npm run blowitallaway\n\n\n');
        console.log(err);
        process.exit();
    }
};

if (process.argv.includes('--delete')) {
    deleteData();
} else {
    importData();
}