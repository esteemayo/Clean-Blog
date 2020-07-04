const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

module.exports = () => {
    mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    })
        .then(con => {
            // console.log(con.connections);
            console.log('MongoDB Connected.....')
        })
        .catch(err => console.log(`Could not connect to mongoDB: ${err}`));
};