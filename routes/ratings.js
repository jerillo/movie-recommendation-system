const express = require('express');
const router = express.Router();
const request = require('request');
const bodyParser = require('body-parser');
const Rating = require('../models/rating');

// Show all user ratings
router.get('/', isLoggedIn, (req, res) => {
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
router.get('/:id/new', isLoggedIn, (req, res) => {
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
router.post('/:id', isLoggedIn, (req, res) => {
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
router.get('/:id', isLoggedIn, (req, res) => {
    Rating.findOne({imdbID: req.params.id}, (err, foundRating) => {
        if (err) {
            res.redirect('/ratings')
        } else {
            res.render('ratings/show', {rating: foundRating})
        }
    });
});

// Edit rating
router.get('/:id/edit', isLoggedIn, (req, res) => {
    Rating.findOne({imdbID: req.params.id}, (err, foundRating) => {
        if (err) {
            res.redirect('/ratings')
        } else {
            res.render('ratings/edit', {rating: foundRating})
        }
    });
});

// Update rating
router.put('/:id', isLoggedIn, (req, res) => {
    Rating.findOneAndUpdate({imdbID: req.params.id}, {$set:{rating: req.body.rating, comment: req.body.comment}}, {new: true}, (err, updatedRating) => {
        if (err) {
            res.redirect('/ratings')
        } else {
            res.redirect('/ratings')
        }
    });
});

// Delete rating
router.delete('/:id', isLoggedIn, (req, res) => {
    Rating.deleteOne({imdbID: req.params.id}, err => {
        if (err) {
            res.redirect('/ratings')
        } else {
            res.redirect('/ratings')
        }
    });
});

// Middleware
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

module.exports = router;
