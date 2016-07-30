'use strict';
var qs = require('querystring');

var request = module.exports = {};

/**
 * Gets form data and calls the callback
 * 
 * @param {Object} req
 * @param {Function} callback
 */
request.withParsedBody = function(req, callback) {
  var postData = '';
  req.on('data', function(data) {
    postData += data.toString();
  });
  req.on('end', function() {
    callback(qs.parse(postData));
  });
  req.on('error', function(err) {
    if (err) {
      throw err;
    }
  });
}