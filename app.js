const express = require("express");
const app = express();
const request = require("request");

app.get("/results", function(req, res) {
    request("")
});

app.listen(3000, function() {
    console.log("APP HAS STARTED");
});