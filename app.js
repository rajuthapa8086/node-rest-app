var http = require('http');
var rh = require('./lib/request-handler.js');

rh.staticDir = __dirname + '/public';

// Routes
require('./routes.js')(rh);

// Server
http.createServer(function(req, res) {
  rh.handle(req, res);
}).listen(8000, function() {
  console.log('Starting server at http://localhost:8000');
});