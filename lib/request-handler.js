'use strict';
var fs = require('fs');
var url = require('url');
var response = require('./response.js');
var request = require('./request.js');
var routeHelper = require('./route-helper.js');

var requestHandler = module.exports = {};

/**
 * @var string
 */
requestHandler.staticDir = '';

/**
 * @var Object
 */
requestHandler.routes = {
  get: {},
  post: {},
  put: {},
  delete: {},
}

/**
 * @var Object
 */
requestHandler.data = {
  qs: {},
  parsedBody: {},
  params: {},
};

/**
 * Handles incoming request
 *
 * @param {Object} req
 * @param {Object} res
 */
requestHandler.handle = function(req, res) {
  var parsedUrl = url.parse(req.url, true);

  req.url = parsedUrl.pathname.replace(/\/+$/, '');

  this.data.qs = parsedUrl.query;

  if (req.url == '') {
    req.url = '/';
  }

  // Handling GET method
  if (req.method == 'GET') {
    this.handleGet(req, res);
  } else if (['POST', 'PUT', 'DELETE'].indexOf(req.method) > -1) {
    this.callRightMethod(req, res);
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
requestHandler.handleGet = function(req, res) {
  if (this.routes.get.hasOwnProperty(req.url)) {
    console.log('200 GET ' + req.url);
    this.routes.get[req.url](req, res, this.data);
  } else {
    var eqvRoute = routeHelper(req.url, this.routes.get);
    if (eqvRoute.length == 0) {
      this.serveStaticOr404(req, res);
    } else {
      console.log('200 GET ' + req.url);
      this.data.params = eqvRoute[2];
      this.routes.get[eqvRoute[1]] = this.routes.get[eqvRoute[0]];
      this.routes.get[eqvRoute[1]](req, res, this.data);
    }
  }
};

/**
 * Handles respective request
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} data
 */
requestHandler.handleMethod = function(req, res, method) {
  if (this.routes[method].hasOwnProperty(req.url)) {
    console.log('200 ' + method.toUpperCase() + ' ' + req.url);
    this.routes[method][req.url](req, res, this.data);
  } else {
    var eqvRoute = routeHelper(req.url, this.routes[method]);
    if (eqvRoute.length == 0) {
      console.log('404 ' + method.toUpperCase() + ' ' + req.url);
      res.writeHead(404);
      res.end('Resource not found');
    } else {
      console.log('200 ' + method.toUpperCase() + ' ' + req.url);
      this.data.params = eqvRoute[2];
      this.routes[method][eqvRoute[1]] = this.routes[method][eqvRoute[0]];
      this.routes[method][eqvRoute[1]](req, res, this.data);
    }
  }
};

/**
 * Calling right method to handle request
 *
 * @param {Object} req
 * @param {Object} res
 */
requestHandler.callRightMethod = function(req, res) {
  var self = this;
  var method = 'post';
  request.withParsedBody(req, function(parsedBody) {
    if (typeof parsedBody._method === 'undefined') {
      method = 'post';
    } else {
      parsedBody._method = parsedBody._method.toLowerCase();
      method = ['put', 'delete']
        .indexOf(parsedBody._method) < 0 ? 'post' : parsedBody._method;
    }
    delete parsedBody._method;
    method = req.method == 'PUT' ? 'put' : method;
    method = req.method == 'DELETE' ? 'delete' : method;
    self.data.parsedBody = parsedBody;
    self.handleMethod(req, res, method);
  });
};