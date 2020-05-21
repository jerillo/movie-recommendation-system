const express = require('express');
const router = express.Router();
const request = require('request');
const bodyParser = require('body-parser');
const Rating = require('../models/rating');

// Display results of search query
router.get('/', (req, res) => {
    const query = req.query.search;
    const url = `http://www.omdbapi.com/?apikey=${process.env.APIKEY}&s=` + query;
    request(url, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            const data = JSON.parse(body);
            if (data.Response === 'False') {
                res.render('results/index', {query: query, dataError: data.Error});
            } else {
                res.render('results/index', {data: data, dataError: data.Error, query: query});
            }
        }
    });
});

// Show page for movie
router.get('/:id', (req, res) => {
    const imdbID= req.params.id;
    const url = `http://www.omdbapi.com/?apikey=${process.env.APIKEY}&plot=full&i=` + imdbID;
    request(url, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            const data = JSON.parse(body);
            if (data.Response === 'False') {
                req.flash('error', 'Movie not found');
                return res.redirect('/');
            }
            Rating.find({imdbID: imdbID}, (err, allRatings) => {
                if (err) {
                    console.log(err);
                } else {
                    if (req.user) {
                        Rating.exists({author: {id: req.user._id, username: req.user.username}, imdbID: imdbID}, (err, result) => {
                            const ratingExists = result;
                            res.render('results/show', {data: data, ratingExists: ratingExists, ratings: allRatings});
                        });
                    } else {
                        res.render('results/show', {data: data, ratingExists: false, ratings: allRatings});
                    }
                }
            });
        }
    });
});

module.exports = router;
