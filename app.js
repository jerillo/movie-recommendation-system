require('dotenv').config({path:'./.env'});

const express = require('express');
const app = express();
const request = require('request');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const Rating = require('./models/rating');
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost:27017/movies', {useNewUrlParser: true});
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(methodOverride('_method'))
app.set('view engine', 'ejs');

// Search page
app.get('/', (req, res) => {
    res.render('search');
});

// Display results of search query
app.get('/results', (req, res) => {
    const query = req.query.search;
    const url = `http://www.omdbapi.com/?apikey=${process.env.APIKEY}&s=` + query;
    request(url, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            const data = JSON.parse(body);
            if (data.Response === 'False') {
                res.render('bad-results', {query: query, error: data.Error});
            } else {
                res.render('results', {data: data, query: query});
            }
        }
    });
});

// Display additional information about specific movie
app.get('/results/:id', (req, res) => {
    const imdbID= req.params.id;
    const url = `http://www.omdbapi.com/?apikey=${process.env.APIKEY}&i=` + imdbID;
    request(url, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            const data = JSON.parse(body);
            res.render('show', {data: data});
        }
    });
});

// Show all user ratings
app.get('/ratings', (req, res) => {
    // Get all ratings from DB
    Rating.find({}, (err, allRatings) => {
        if (err) {
            console.log(err);
        } else {
            let totalTime = 0;
            allRatings.forEach((rating) => {
                totalTime += rating.runtime;
            });
            res.render('ratings', {ratings: allRatings, totalTime: totalTime});
        }
    });
});

// Show form to create new rating
app.get('/ratings/:id/new', (req, res) => {
    const imdbID = req.params.id;
    const url = `http://www.omdbapi.com/?apikey=${process.env.APIKEY}&i=` + imdbID;
    request(url, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            const data = JSON.parse(body);
            res.render('new', {data: data});
        }
    });
});

// Add new rating to ratings DB
app.post('/ratings/:id', (req, res) => {
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

// Edit rating
app.get('/ratings/:id/edit', (req, res) => {
    Rating.findOne({imdbID: req.params.id}, (err, foundRating) => {
        if (err) {
            res.redirect('/ratings')
        } else {
            res.render('edit', {rating: foundRating})
        }
    })
})

// Update rating
app.put('/ratings/:id', (req, res) => {
    Rating.findOneAndUpdate({imdbID: req.params.id}, {$set:{rating: req.body.rating, comment: req.body.comment}}, {new: true}, (err, updatedRating) => {
        if (err) {
            res.redirect('/ratings')
        } else {
            res.redirect('/ratings')
        }
    })
})

// Delete rating
app.delete('/ratings/:id', (req, res) => {
    Rating.deleteOne({imdbID: req.params.id}, err => {
        if (err) {
            res.redirect('/ratings')
        } else {
            res.redirect('/ratings')
        }
    })
})


app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
