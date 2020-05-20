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
                res.render('results/bad-results', {query: query, error: data.Error});
            } else {
                res.render('results/index', {data: data, query: query});
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
            Rating.exists({imdbID: imdbID}, (err, result) => {
                const ratingExists = result;
                const data = JSON.parse(body);
                res.render('results/show', {data: data, ratingExists: ratingExists});
            });
        }
    });
});

module.exports = router;
