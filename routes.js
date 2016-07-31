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

function getContactById(id) {
  for(var index in contacts) {
    if (contacts[index].id == id) {
      return contacts[index];
    }
  }
  return null;
}

/**
 * @param {Object} rh
 */
module.exports = function(rh) {

  // GET /
  rh.get('/', function(req, res, data) {
    response.swigRender(res, templatePath + '/index.html');
  });

  // GET /contacts
  rh.get('/contacts', function(req, res, data) {
    response.swigRender(res, templatePath + '/contacts/index.html', {
      contacts: contacts
    });
  });

  // GET /contacts/add
  rh.get('/contacts/add', function(req, res, data) {
    response.swigRender(res, templatePath + '/contacts/add.html');
  });

  // POST /contacts
  rh.post('/contacts', function(req, res, data) {
    var postData = data.parsedBody;
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

  // GET /contacts/{id}
  rh.get('/contacts/{id}', function(req, res, data) {
    var contact = getContactById(data.params.id);
    if (contact == null) {
      console.log('404 DELETE ' + req.url);
      res.writeHeader(404, {
        'Content-Type': 'text/plain',
      });
      res.end();      
    } else {
      response.swigRender(res, templatePath + '/contacts/show.html', {
        contact: contact
      });      
    }
  });

  // GET /contacts/{id}/edit
  rh.get('/contacts/{id}/edit', function(req, res, data) {
    var contact = getContactById(data.params.id);
    if (contact == null) {
      console.log('404 DELETE ' + req.url);
      res.writeHeader(404, {
        'Content-Type': 'text/plain',
      });
      res.end();      
    } else {
      response.swigRender(res, templatePath + '/contacts/edit.html', {
        contact: contact
      });      
    }
  });

  // PUT /contacts/{id}
  rh.put('/contacts/{id}', function(req, res, data) {
    var contact = getContactById(data.params.id);
    if (contact == null) {
      console.log('404 DELETE ' + req.url);
      res.writeHeader(404, {
        'Content-Type': 'text/plain',
      });
      res.end();
    } else {
      var putData = data.parsedBody;

      contacts[contacts.indexOf(contact)] = {
        id: contact.id,
        full_name: putData.full_name,
        email: putData.email
      };
      fs.writeFile(dataFilePath, JSON.stringify(contacts), function (err) {
        if (err) {
          throw err;
        }
        response.redirect(res, '/contacts');
      });
    }
  });

  // DELETE /contacts/{id}
  rh.delete('/contacts/{id}', function(req, res, data) {
    var contact = getContactById(data.params.id);
    if (contact == null) {
      console.log('404 DELETE ' + req.url);
      res.writeHeader(404, {
        'Content-Type': 'text/plain',
      });
      res.end();
    } else {
      contacts.splice(contacts.indexOf(contact), 1);
      fs.writeFile(dataFilePath, JSON.stringify(contacts), function (err) {
        if (err) {
          throw err;
        }
        response.redirect(res, '/contacts');
      });
    }
  });
};