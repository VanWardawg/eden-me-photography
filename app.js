// web.js
var express = require("express");
var mongodb = require("mongodb");
var app = express();

var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://user:userpw@ds033579.mongolab.com:33579/heroku_app22691347';

mongodb.Db.connect(mongoUri, function (err, db) {
  db.collection('mydocs', function(er, collection) {
    collection.insert({'mykey': 'myvalue'}, {safe: true}, function(er,rs) {
    });
  });
});


// redirect all others to HTML5 history
app.get('*', function(req, res) {
	return res.status(404).sendfile('public/index.html');
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});