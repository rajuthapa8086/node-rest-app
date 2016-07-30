'use strict';
var fs = require('fs');
var response = require('./lib/response.js');

/**
 * @var {string}
 */
var templatePath = __dirname + '/templates';

/**
 * @var {string}
 */
var dataFilePath = __dirname + '/data/contacts.json';

/**
 * @var {Array}
 */
var contacts = require('./data/contacts.json');

/**
 * @param {Object} rh
 */
module.exports = function(rh) {

  // GET /
  rh.get('/', function(req, res) {
    response.swigRender(res, templatePath + '/index.html');
  });

  // GET /contacts
  rh.get('/contacts', function(req, res) {
    response.swigRender(res, templatePath + '/contacts/index.html', {
      contacts: contacts
    });
  });

  // GET /contacts/add
  rh.get('/contacts/add', function(req, res) {
    response.swigRender(res, templatePath + '/contacts/add.html');
  });

  rh.post('/contacts', function(req, res, data) {
    var postData = data.data;
    var date = new Date();
    var id = [date.getFullYear(), date.getMonth(), date.getDate(),
      date.getHours(), date.getMinutes(), date.getSeconds()].join('');
    contacts.push({
      id: id,
      full_name: postData.full_name,
      email: postData.email
    });
    fs.writeFile(dataFilePath, JSON.stringify(contacts), function (err) {
      if (err) {
        throw err;
      }
      response.redirect(res, '/contacts');
    });
  });
};