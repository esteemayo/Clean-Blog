require('dotenv').config();
const express = require('express');
const passport = require('passport');

const app = express();

require('./startup/routes')(app);
require('./startup/db')();

// PASSPORT CONFIG
require('./config/passport')(passport);




const PORT = process.env.PORT || 4001;

app.listen(PORT, () => console.log(`APP LISTENING ON PORT ${PORT}`));