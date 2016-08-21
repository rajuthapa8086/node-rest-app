'use strict';
var fs = require('fs');
var swig = require('swig');

var response = module.exports = {};

/**
 * Renders HTML without data.
 *
 * @param {Object} res
 * @param string template
 */
response.render = function(res, template) {
  res.writeHead(200, {
    'Content-Type': 'text/html'
  });
  fs.readFile(template, "utf8", function(err, data) {
    if (err) {
      throw err;
    }
    res.end(data);
  });
};

/**
 * Response 404 Not Found
 *
 * @param {Object} res
 */

response.notFound = function(res) {
  res.writeHead(404, {
    'Content-Type': 'text/plain',
  });
  res.end('404 Not Found.\n');
};

/**
 * Renders HTML with data
 * (Swig is used)
 *
 * @param {Object} res
 * @param string template
 */
response.swigRender = function(res, template, data){
  res.writeHead(200, {
    'Content-Type': 'text/html'
  });
  res.end(swig.renderFile(template, data));
};

/**
 * Redirects to url.
 *
 * @param {Object} res
 * @param string url
 */
response.redirect = function(res, url) {
  res.writeHead(302, {
    'Location': url
  });
  res.end();
};