'use strict';
var fs = require('fs');
var url = require('url');
var response = require('./response.js');
var request = require('./request.js');

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
  var parsedUrl = url.parse(req.url,true);

  if (parsedUrl.pathname != '/') {
    req.url = parsedUrl.pathname.replace(/\/+$/, "");
  }

  // Handling GET method
  if (req.method == 'GET') {
    this.handleGet(req, res, parsedUrl.query);
  } else if (['POST', 'PUT', 'DELETE'].indexOf(req.method) > -1) {
    this.callRightMethod(req, res, parsedUrl.query);
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

  fs.exists(file, existsCallback);

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
};

/**
 * Handles GET request
 *
 * @param {Object} req
 * @param {Object} res
 */
requestHandler.handleGet = function(req, res, qs) {
  if (this.routes.get.hasOwnProperty(req.url)){
    console.log('200 GET ' + req.url);
    this.routes.get[req.url](req, res, {
      qs: qs,
    });
  } else{
    this.serveStaticOr404(req, res);
  }
};

/**
 * Handles respective request
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} data
 */
requestHandler.handleMethod = function(req, res, method, data) {
  if (this.routes[method].hasOwnProperty(req.url)) {
    console.log('200 ' + method.toUpperCase() + ' ' + req.url);
    this.routes[method][req.url](req, res, data);
  } else {
    console.log('404 ' + method.toUpperCase() + ' ' + req.url);
    res.writeHead(404);
    res.end('Resource not found');
  }
};

/**
 * Calling right method to handle request
 *
 * @param {Object} req
 * @param {Object} res
 */
requestHandler.callRightMethod = function(req, res, qs) {
  var self = this;
  var method = 'post';
  request.withParsedBody(req, function(data) {
    if (typeof data._method === 'undefined') {
      method = 'post';
    } else {
      data._method = data._method.toLowerCase();
      method = ['put', 'delete'].indexOf(data._method) < 0
        ? 'post'
        : data._method;
    }
    delete data._method;
    method = req.method == 'PUT' ? 'put' : method;
    method = req.method == 'DELETE' ? 'delete' : method;
    self.handleMethod(req, res, method, {
      qs: qs,
      data: data
    });
  });
};