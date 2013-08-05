var express = require('express');

var app = express.createServer(express.logger());

// make the send conten read from index.html
var fs = require('fs');
var indexFile = 'index.html';
var content = fs.readFileSync(indexFile).toString('utf-8');
console.log(content)

app.get('/', function(request, response) {
  response.send(content);
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
