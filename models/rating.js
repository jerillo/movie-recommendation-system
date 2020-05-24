const mongoose = require('mongoose');
const ratingSchema = new mongoose.Schema({
	title: String,
	year: String,
	createdAt: { type: Date, default: Date.now },
	imdbID: String,
	poster: String,
	runtime: Number,
	rating: Number,
	comment: String,
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		username: String
	}
});
module.exports = mongoose.model('Rating', ratingSchema);
