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
var staticDir = '';

/**
 * @var Object
 */
var routes = {
  get: {},
  post: {},
  put: {},
  delete: {},
}

/**
 * @var Object
 */
var data = {
  qs: {},
  parsedBody: {},
  params: {},
};

/**
 * @param {String} dirpath
 */
requestHandler.setStaticDir = function(dirpath) {
  staticDir = dirpath;
}

function logRequest(req) {
  var date = new Date();
  var ts = [date.getFullYear(), date.getMonth(), date.getDay()].join('-') +
           ' ' +
           [date.getHours(), date.getMinutes(), date.getSeconds()].join(':');
  return '[' + ts + '] ' + req.method + ' --> ' + req.url;
}

/**
 * Handles incoming request
 *
 * @param {Object} req
 * @param {Object} res
 */
requestHandler.handle = function(req, res) {
  var parsedUrl = url.parse(req.url, true);

  console.log(logRequest(req));

  req.url = parsedUrl.pathname.replace(/\/+$/, '');
  data.qs = parsedUrl.query;

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
  routes.get[url] = callback;
};

/**
 * Registers the post route
 *
 * @param {string} Url
 * @param {Function} callback
 */
requestHandler.post = function(url, callback) {
  routes.post[url] = callback;
};

/**
 * Registers the put route
 *
 * @param {string} Url
 * @param {Function} callback
 */
requestHandler.put = function(url, callback) {
  routes.put[url] = callback;
};

/**
 * Registers the delete route
 *
 * @param {string} Url
 * @param {Function} callback
 */
requestHandler.delete = function(url, callback) {
  routes.delete[url] = callback;
};

/**
 * Serves static files
 *
 * @param {Object} req
 * @param {Object} res
 */
requestHandler.serveStaticOrResponse404 = function(req, res) {
  var mimes = {
    'txt': 'text/plain',
    'html': 'text/html',
    'js': 'text/js',
    'css': 'text/css',
    'jpg': 'image/jpg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
  }
  var ext = req.url.split('.').pop();
  var mime = mimes.hasOwnProperty(ext) ? mimes[ext] : 'text/plain';

  fs.readFile(staticDir + req.url, function(err, content) {
    if (err) {
      response.notFound(res);
    }
    res.writeHead(200, {
      'Content-Type': mime
    });
    res.end(content);
  });

};

/**
 * Handles GET request
 *
 * @param {Object} req
 * @param {Object} res
 */
requestHandler.handleGet = function(req, res) {
  if (routes.get.hasOwnProperty(req.url)) {
    routes.get[req.url](req, res, data);
  } else {
    var eqvRoute = routeHelper(req.url, routes.get);
    if (eqvRoute.length == 0) {
      this.serveStaticOrResponse404(req, res);
    } else {
      data.params = eqvRoute[2];
      routes.get[eqvRoute[1]] = routes.get[eqvRoute[0]];
      routes.get[eqvRoute[1]](req, res, data);
    }
  }
};

/**
 * Handles respective request
 *
 * @param {Object} req
 * @param {Object} res
 * @param {String} method
 */
requestHandler.handleMethod = function(req, res, method) {
  if (routes[method].hasOwnProperty(req.url)) {
    routes[method][req.url](req, res, data);
  } else {
    var eqvRoute = routeHelper(req.url, routes[method]);
    if (eqvRoute.length == 0) {
      res.writeHead(404);
      res.end('Resource not found');
    } else {
      data.params = eqvRoute[2];
      routes[method][eqvRoute[1]] = routes[method][eqvRoute[0]];
      routes[method][eqvRoute[1]](req, res, data);
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
    data.parsedBody = parsedBody;
    self.handleMethod(req, res, method);
  });
};