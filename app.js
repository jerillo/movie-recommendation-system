require('dotenv').config({path:'./.env'});

const express = require("express");
const app = express();
const request = require("request");
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("search");
});

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

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});