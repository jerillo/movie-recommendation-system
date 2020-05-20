require('dotenv').config({path:'./.env'});

const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const methodOverride = require('method-override')
const Rating = require('./models/rating');
const User = require('./models/user');
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost:27017/movies', {useNewUrlParser: true, useUnifiedTopology: true});

const app = express();
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

// Search page
app.get('/', (req, res) => {
    res.render('search');
});

// ==========================================
// RESULTS ROUTES
// ==========================================

// Display results of search query
app.get('/results', (req, res) => {
    const query = req.query.search;
    const url = `http://www.omdbapi.com/?apikey=${process.env.APIKEY}&s=` + query;
    request(url, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            const data = JSON.parse(body);
            if (data.Response === 'False') {
                res.render('results/bad-results', {query: query, error: data.Error});
            } else {
                res.render('results/index', {data: data, query: query});
            }
        }
    });
});

// Show page for movie
app.get('/results/:id', (req, res) => {
    const imdbID= req.params.id;
    const url = `http://www.omdbapi.com/?apikey=${process.env.APIKEY}&plot=full&i=` + imdbID;
    request(url, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            Rating.exists({imdbID: imdbID}, (err, result) => {
                const ratingExists = result;
                const data = JSON.parse(body);
                res.render('results/show', {data: data, ratingExists: ratingExists});
            });
        }
    });
});

// ==========================================
// RATINGS ROUTES
// ==========================================

// Show all user ratings
app.get('/ratings', isLoggedIn, (req, res) => {
    // Get all ratings from DB
    Rating.find({}, (err, allRatings) => {
        if (err) {
            console.log(err);
        } else {
            let totalTime = 0;
            allRatings.forEach((rating) => {
                totalTime += rating.runtime;
            });
            res.render('ratings/index', {ratings: allRatings, totalTime: totalTime});
        }
    });
});

// Show form to create new rating
app.get('/ratings/:id/new', isLoggedIn, (req, res) => {
    const imdbID = req.params.id;
    const url = `http://www.omdbapi.com/?apikey=${process.env.APIKEY}&i=` + imdbID;
    request(url, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            const data = JSON.parse(body);
            res.render('ratings/new', {data: data});
        }
    });
});

// Add new rating to ratings DB
app.post('/ratings/:id', isLoggedIn, (req, res) => {
    const imdbID = req.params.id;
    const url = `http://www.omdbapi.com/?apikey=${process.env.APIKEY}&i=` + imdbID;
    request(url, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            data = JSON.parse(body);
            const rating = req.body.rating;
            const comment = req.body.comment;
            const newRating = {
                title: data.Title,
                year: data.Year,
                imdbID: data.imdbID,
                poster: data.Poster,
                runtime: parseFloat(data.Runtime),
                rating: rating,
                comment: comment
            };
            // Create a new rating and save to ratings DB
            Rating.create(newRating, (err, newlyCreated) => {
                if (err) {
                    console.log(err);
                } else {
                    res.redirect('/ratings');
                }
            });
        }
    });
});

// View rating
app.get('/ratings/:id', isLoggedIn, (req, res) => {
    Rating.findOne({imdbID: req.params.id}, (err, foundRating) => {
        if (err) {
            res.redirect('/ratings')
        } else {
            res.render('ratings/show', {rating: foundRating})
        }
    });
});

// Edit rating
app.get('/ratings/:id/edit', isLoggedIn, (req, res) => {
    Rating.findOne({imdbID: req.params.id}, (err, foundRating) => {
        if (err) {
            res.redirect('/ratings')
        } else {
            res.render('ratings/edit', {rating: foundRating})
        }
    });
});

// Update rating
app.put('/ratings/:id', isLoggedIn, (req, res) => {
    Rating.findOneAndUpdate({imdbID: req.params.id}, {$set:{rating: req.body.rating, comment: req.body.comment}}, {new: true}, (err, updatedRating) => {
        if (err) {
            res.redirect('/ratings')
        } else {
            res.redirect('/ratings')
        }
    });
});

// Delete rating
app.delete('/ratings/:id', isLoggedIn, (req, res) => {
    Rating.deleteOne({imdbID: req.params.id}, err => {
        if (err) {
            res.redirect('/ratings')
        } else {
            res.redirect('/ratings')
        }
    });
});

// ==========================================
// AUTH ROUTES
// ==========================================

// Show register form
app.get('/register', (req, res) => {
    res.render('register');
});

// Handle sign up logic
app.post('/register', (req, res) => {
    const newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            return res.render('register');
        }
        passport.authenticate('local')(req, res, () => {
            res.redirect('/')
        });
    }); 
});

// Show login form
app.get('/login', (req, res) => {
    res.render('login');
});

// Handle login logic
app.post('/login', passport.authenticate('local', 
    {
        successRedirect: '/',
        failureRedirect: '/login'
    }), (req, res) => {
    res.send('login');
});

// Logic route
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// Middleware
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
