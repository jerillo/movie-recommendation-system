require('dotenv').config({path:'./.env'});
const express = require('express');
const app = express();
const request = require('request');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const methodOverride = require('method-override')
const Rating = require('./models/rating');
const User = require('./models/user');
const PORT = process.env.PORT || 3000;

// Requiring routes
const resultRoutes = require('./routes/results');
const ratingRoutes = require('./routes/ratings');
const indexRoutes = require('./routes/index');

mongoose.connect('mongodb://localhost:27017/movies', {useNewUrlParser: true, useUnifiedTopology: true});
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'))
app.set('view engine', 'ejs');

// PASSPORT CONFIGURATION
app.use(require('express-session')({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Pass currentUser as param
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

// Routes
app.use('/', indexRoutes);
app.use('/results', resultRoutes);
app.use('/ratings', ratingRoutes);

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
