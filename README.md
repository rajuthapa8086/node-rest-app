# Node REST App

This application is made by using node js and [Swig](http://paularmstrong.github.io/swig/) template engine.

**Note:** This application does not use any third party libraries other than Swig template engine.

## Features

 * REST Methods (GET, POST, PUT, DELETE).
 * Method Spoofing.
 * Url Paramter.
 * Serving static file.


## Installing and Running
 * `git clone https://github.com/rajuthapa8086/node-rest-app.git`
 * `cd ./node-rest-app`
 * `cp ./data/config.json.dist ./data/config.json`
 * `npm install`
 * `node app.js` - or - `nodemon app.js`


You can continue working on this project. Make a new route file `foo-routes.js` into root directory or any other location inside root directory of this project.

Inside your `app.js`

```js
var http = require('http');
var rh = require('./lib/request-handler.js');

rh.staticDir = __dirname + '/public';

// Routes
require('./routes.js')(rh);

// Add your routes here
require('./foo-routes.js')(rh);

// Server
http.createServer(function(req, res) {
  rh.handle(req, res);
}).listen(8000, function() {
  console.log('Starting server at http://localhost:8000');
});
```

Now in your `foo-routes.js` file:
```js
'use strict';
var fs = require('fs');
var response = require('./lib/response.js');

// You can change it according your preference.
var templatePath = __dirname + '/templates';

module.exports = function(rh) {

  // GET /foo
  rh.get('/foo', function(req, res, data) {
    // code...
  });

  // GET /foo/add
  rh.get('/foo/add', function(req, res, data) {
    // code...
  });

  // POST /foo
  rh.post('/foo', function(req, res, data) {
    // code...
  });

  // GET /foo/{id}
  rh.get('/foo/{id}', function(req, res, data) {
    // code...
  });

  // GET /foo/{id}/edit
  rh.get('/foo/{id}/edit', function(req, res, data) {
    // code...
  });
  
  // PUT /foo/{id}
  rh.put('/foo/{id}', function(req, res, data) {
    // code...
  });

  // DELETE /foo/{id}
  rh.delete('/foo/{id}', function(req, res, data) {
    // code...
  });
};
```

In every `rh.<method>('url', function(req, res, data) {}`

`data` will contain an object of follwing properties:

```js
{
  qs: {...},
  parsedBody: {...},
  params: {...},  
}
```

Where `qs` is query string data, suppose your url is `/foo?sort=bar&order=asc` then `qs` will contain `{sort: 'bar', order: 'asc'}`. Similary `parsedBody` will contain the form data as object and `params` will contain the url paramter value (`/foo/{id}/{slug}` is called as `/foo/10/bar-baz` then `params` will contain `{id: 10, slug: 'bar-baz'}`.
