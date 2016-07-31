'use strict';

/**
 * Returns equivalent route url from patterned url
 * ======================================================
 *  example:
 *    /foo/{bar}  ==> is registered parametered route url
 *    /foo/baz    ==> is requested route url
 *    function will return ['/foo/{bar}', '/foo/baz', data]
 *    where data is {bar: baz}
 * ======================================================
 * 
 * @param {string} requestedUrl
 * @param {Object} requestedUrl
 */
module.exports = function(requestedUrl, routes) {
  var arrayedUrl = function(url) {
    return url.replace(/^\/+|\/+$/gm, '').split('/');
  }
  var ret = [];
  var data = {};
  var routesKeys = Object.keys(routes).reverse();

  for (var index in routesKeys) {
    var arr1 = arrayedUrl(routesKeys[index]);
    var arr2 = arrayedUrl(requestedUrl);
    if (arr1.length == arr2.length) {
      for (var i in arr1) {
        if (arr1[i] != arr2[i]) {
          var dataKey = arr1[i]
            .replace('{', '')
            .replace('}', '');
          if (dataKey.length == arr1[i].length - 2) {
            arr1[i] = arr2[i];
            data[dataKey] = arr2[i];
          }
        }
      }
      if (JSON.stringify(arr1) == JSON.stringify(arr2)) {
        ret = [routesKeys[index], requestedUrl, data];
      }
    }
  }
  return ret;
}