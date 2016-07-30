'use strict';
var response = require('./response.js');
var fs = require('fs');

var requestHandler = module.exports = {};

/**
 * @var {string}
 */
requestHandler.staticDir = '';

/**
 * @var {Object}
 */
requestHandler.routes = {
  get: {},
  post: {},
  put: {},
  delete: {},
}

/**
 * Handles incoming request
 *
 * @param {Object} req
 * @param {Object} res
 */
requestHandler.handle = function(req, res) {
  // Handling GET method
  if (req.method == 'GET') {
    this.handleGet(req, res);
  }

  // Handling POST method
  if (req.method == 'POST') {
    this.handlePost(req, res);
  }
};

/**
 * Registers the get route
 *
 * @param {string} Url
 * @param {Function} callback
 */
requestHandler.get = function(url, callback) {
  this.routes.get[url] = callback;
};

/**
 * Registers the post route
 *
 * @param {string} Url
 * @param {Function} callback
 */
requestHandler.post = function(url, callback) {
  this.routes.post[url] = callback;
};

/**
 * Registers the put route
 *
 * @param {string} Url
 * @param {Function} callback
 */
requestHandler.put = function(url, callback) {
  this.routes.put[url] = callback;
};

/**
 * Registers the delete route
 *
 * @param {string} Url
 * @param {Function} callback
 */
requestHandler.delete = function(url, callback) {
  this.routes.delete[url] = callback;
};

/**
 * Serves static files
 *
 * @param {string} Url
 * @param {Function} callback
 */
requestHandler.serveStaticOr404 = function(req, res) {
  var file = this.staticDir + req.url;

  // Avoiding callback hell
  function existsCallback(exists) {
    if (exists) {
      fs.lstat(file, lstatCallback);
    } else {
      console.log('404 GET ' + req.url);
      res.writeHead(404, {
        'Content-Type': 'text/plain'
      });
      res.end('Resource Not Found');
    }
  }

  // Avoiding callback hell
  function lstatCallback(err, stats) {
    if (stats.isFile()) {
      console.log('200 GET ' + req.url);
      response.renderStatic(res, file);
    }
  }
  fs.exists(file, existsCallback);
};

/**
 * Handles GET request
 *
 * @param {Object} req
 * @param {Object} res
 */
requestHandler.handleGet = function(req, res) {
  if (this.routes.get.hasOwnProperty(req.url)){
    console.log('200 GET ' + req.url);
    this.routes.get[req.url](req, res);
  } else{
    this.serveStaticOr404(req, res);
  }
};

/**
 * Handles POST request
 *
 * @param {Object} req
 * @param {Object} res
 */
requestHandler.handlePost = function(req, res) {

};