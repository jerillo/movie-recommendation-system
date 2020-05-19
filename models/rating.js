const mongoose = require('mongoose');
const ratingSchema = new mongoose.Schema({
    title: String,
    year: String,
    imdbID: String,
    poster: String,
    runtime: Number,
    rating: Number,
    comment: String
});
module.exports = mongoose.model("Rating", ratingSchema);