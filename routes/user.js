const express = require('express');
const router = express.Router();
const Rating = require('../models/rating');
const User = require('../models/user');

// Shows ratings of a user
router.get('/:id', (req, res) => {
	// Get all ratings from DB
	if (req.user && req.user._id.equals(req.params.id)) {
		res.redirect('/ratings');
	}

	User.findById(req.params.id, (err, foundUser) => {
		if (err || !foundUser) {
			req.flash('error', 'User not found');
			res.redirect('/');
		} else {
			Rating.find(
				{ author: { id: foundUser._id, username: foundUser.username } },
				(err, ratings) => {
					if (err) {
						console.log('ERROR');
					} else {
						let totalTime = 0;
						ratings.forEach((rating) => {
							totalTime += rating.runtime;
						});
						res.render('user/show', {
							ratings: ratings,
							totalTime: totalTime,
							username: foundUser.username
						});
					}
				}
			);
		}
	});
});

module.exports = router;
