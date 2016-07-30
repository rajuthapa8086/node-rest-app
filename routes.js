module.exports = function(rh) {

  // GET /
  rh.get('/', function(req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/plain'
    });
    res.end("Success");
  });
};