const mongoose = require('mongoose');

module.exports = () => {
    const db = process.env.MONGODB_URI;

    mongoose.connect(db, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
        .then(con => {
            // console.log(con.connections);
            console.log(`MongoDB Connected → ${db}`)
        });
};