var fs = require('fs');
var swig = require('swig');

module.exports = response = {};

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
 * Renders HTML with data.
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
 * Renders static files.
 *
 * @param {Object} res
 * @param string filePath
 */
response.renderStatic = function(res, filePath) {
  var ext = filePath.split('.').slice(-1)[0];
  var mimies = {
    'js': 'text/javascript',
    'css': 'text/css',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'txt': 'text/plain',
  }
  var mime = mimies.hasOwnProperty(ext) ? mimies[ext] : 'text/plain';
  res.writeHead(200, {
    'Content-Type': mime,
  });
  fs.readFile(filePath, function(err, data) {
    res.end(data);
  });
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