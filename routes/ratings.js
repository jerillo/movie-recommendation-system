const express = require('express');
const router = express.Router();
const request = require('request');
const Rating = require('../models/rating');
const middleware = require('../middleware');

// Show all user ratings
router.get('/', middleware.isLoggedIn, (req, res) => {
	// Get all ratings from DB
	Rating.find(
		{ author: { id: req.user._id, username: req.user.username } },
		(err, ratings) => {
			if (err) {
				console.log('ERROR');
			} else {
				let totalTime = 0;
				ratings.forEach((rating) => {
					totalTime += rating.runtime;
				});
				res.render('ratings/index', {
					ratings: ratings,
					totalTime: totalTime
				});
			}
		}
	);
});

// Show form to create new rating
router.get('/:id/new', middleware.isLoggedIn, (req, res) => {
	const imdbID = req.params.id;
	const url =
		`http://www.omdbapi.com/?apikey=${process.env.APIKEY}&i=` + imdbID;
	request(url, (error, response, body) => {
		if (!error && response.statusCode == 200) {
			const data = JSON.parse(body);
			res.render('ratings/new', { data: data });
		}
	});
});

// Add new rating to ratings DB
router.post('/:id', middleware.isLoggedIn, (req, res) => {
	const imdbID = req.params.id;
	const url =
		`http://www.omdbapi.com/?apikey=${process.env.APIKEY}&i=` + imdbID;
	request(url, (error, response, body) => {
		if (!error && response.statusCode == 200) {
			const data = JSON.parse(body);
			const rating = req.body.rating;
			const comment = req.body.comment;
			const newRating = {
				title: data.Title,
				year: data.Year,
				imdbID: data.imdbID,
				poster: data.Poster,
				runtime: parseFloat(data.Runtime),
				rating: rating,
				comment: comment,
				author: {
					id: req.user._id,
					username: req.user.username
				}
			};
			if (isNaN(newRating.runtime)) {
				newRating.runtime = 0;
			}
			// Create a new rating and save to ratings DB
			Rating.create(newRating, (err, newlyCreated) => {
				if (err) {
					console.log(err);
				} else {
					req.user.ratings.push(newlyCreated);
					req.user.save();
					res.redirect('/ratings');
				}
			});
		}
	});
});

// View rating
router.get('/:id', middleware.isLoggedIn, (req, res) => {
	Rating.findOne(
		{
			author: { id: req.user._id, username: req.user.username },
			imdbID: req.params.id
		},
		(err, foundRating) => {
			if (err || !foundRating) {
				req.flash('error', 'Rating not found');
				res.redirect('/ratings');
			} else {
				res.render('ratings/show', { rating: foundRating });
			}
		}
	);
});

// Edit rating
router.get('/:id/edit', middleware.isLoggedIn, (req, res) => {
	Rating.findOne(
		{
			author: { id: req.user._id, username: req.user.username },
			imdbID: req.params.id
		},
		(err, foundRating) => {
			if (err || !foundRating) {
				req.flash('error', 'Rating not found');
				res.redirect('/ratings');
			} else {
				res.render('ratings/edit', { rating: foundRating });
			}
		}
	);
});

// Update rating
router.put('/:id', middleware.isLoggedIn, (req, res) => {
	Rating.findOneAndUpdate(
		{
			author: { id: req.user._id, username: req.user.username },
			imdbID: req.params.id
		},
		{ $set: { rating: req.body.rating, comment: req.body.comment } },
		{ new: true },
		(err, updatedRating) => {
			if (err || !updatedRating) {
				req.flash('error', 'Rating not found');
				res.redirect('/ratings');
			} else {
				res.redirect('/ratings');
			}
		}
	);
});

// Delete rating
router.delete('/:id', middleware.isLoggedIn, (req, res) => {
	Rating.deleteOne(
		{
			author: { id: req.user._id, username: req.user.username },
			imdbID: req.params.id
		},
		(err) => {
			if (err) {
				req.flash('error', 'Rating not found');
				res.redirect('/ratings');
			} else {
				res.redirect('/ratings');
			}
		}
	);
});

module.exports = router;
