// web.js
var express = require("express");
var mongodb = require("mongodb");
var app = express();


// Configuration
app.use(express.compress());
app.use(express.urlencoded())
app.use(express.json())
app.use(express.static('Public'));



app.get('/', function(req, res) {
  res.send('Hello World!');
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});