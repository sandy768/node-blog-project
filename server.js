require('dotenv').config();
const express = require('express');
const appServer = express();
const PORT = process.env.PORT || 4200;
const mongoose = require('mongoose');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const blogRouter = require('./Router/blogRouter');

appServer.set('view engine', 'ejs');
appServer.set('views', 'View');

appServer.use(express.urlencoded({ extended: true }));
appServer.use(express.static(path.join(__dirname, 'Public')));
appServer.use(express.static(path.join(__dirname, 'uploads')));

appServer.use(flash());

appServer.use(session({
    secret: 'secret765493425',
    resave: false,
    saveUninitialized: false
}))

appServer.use(cookieParser());

appServer.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, proxy-revalidate'
    );
    next();
});
appServer.use(blogRouter);
mongoose.connect(process.env.DB_URL)
    .then(res => {
        appServer.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        })
    })
    .catch(err => {
        console.log("Error to connect to database", err);
    })