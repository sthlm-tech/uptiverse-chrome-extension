import * as httpHelper from './../common/httpHelper.js';
var service = {};

service.getComments = function(identifier, callback) {
  var searchUrl = "https://uptiverse-comments.herokuapp.com/comments/"+identifier;
  httpHelper.get(searchUrl, function(response){
    callback(response);
  });
}

export default service;
