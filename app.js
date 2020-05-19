require('dotenv').config({path:'./.env'});

const express = require("express");
const app = express();
const request = require("request");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 3000;

mongoose.connect("mongodb://localhost:27017/yelp_camp", {useNewUrlParser: true});
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set("view engine", "ejs");

// SCHEMA SETUP
const ratingSchema = new mongoose.Schema({
    title: String,
    imdbID: String,
    runtime: String,
    userRating: Float,
    imdbRating: Float
});

// Search page
app.get("/", (req, res) => {
    res.render("search");
});

// Display results of search query
app.get("/results", (req, res) => {
    const query = req.query.search;
    const url = `http://www.omdbapi.com/?apikey=${process.env.APIKEY}&s=` + query;
    request(url, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            const data = JSON.parse(body);
            res.render("results", {data: data, query: query});
        }
    });
});

// Display additional information about specific movie
app.get("/results/:id", (req, res) => {
    const imdbID= req.params.id;
    const url = `http://www.omdbapi.com/?apikey=${process.env.APIKEY}&i=` + imdbID;
    request(url, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            const data = JSON.parse(body);
            res.render("show", {data: data});
        }
    });
});

// Show form to create new rating
app.get("/ratings/new", (req, res) => {
    console.log("NEW PAGE")
    res.render("new");
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
