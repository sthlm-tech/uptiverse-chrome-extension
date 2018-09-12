import * as httpHelper from "./../common/httpHelper.js";
import * as linkedInUserIdHelper from "./../common/linkedInUserIdHelper.js";
var service = {};
var recruitIdCache = {};

service.getRecruit = function(currentUrl, callback) {
  var searchUrl = "https://uptiverse-recruits.herokuapp.com/recruits/find";
  var requestData = { link: currentUrl };
  httpHelper.post(searchUrl, requestData, function(response) {
    callback(response);
  });
};

service.createRecruit = function(recruit, callback) {
  var searchUrl = "https://uptiverse-recruits.herokuapp.com/recruits/create";
  var requestData = { recruit: recruit };
  httpHelper.post(searchUrl, requestData, function(response) {
    callback(response);
  });
};

service.getRecruitId = function(currentUrl, callback) {
  linkedInUserIdHelper.parse(currentUrl, function(profileId) {
    if (profileId) {
      if (recruitIdCache[profileId]) {
        callback(recruitIdCache[profileId]);
      } else {
        service.getRecruit(currentUrl, function(response) {
          if (response.recruits.length > 0) {
            recruitIdCache[profileId] = response.recruits[0]._id;
            callback(response.recruits[0]._id);
          } else {
            callback();
          }
        });
      }
    }
  });
};

export default service;
