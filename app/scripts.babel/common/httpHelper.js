var httpHelper = {};

  httpHelper.post = function (url, data, callback){
    httpHelper.parseAuthorizationCookie(function(authToken){
      var xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('Authorization', authToken);
      xhr.onreadystatechange = function() {//Call a function when the state changes.
          if(xhr.readyState == 4 && xhr.status == 200) {
              callback(JSON.parse(xhr.responseText));
          }
      }
      xhr.send(JSON.stringify(data));
    });
  }

  httpHelper.get = function (url, callback){
    httpHelper.parseAuthorizationCookie(function(authToken){
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('Authorization', authToken);
      xhr.onreadystatechange = function() {//Call a function when the state changes.
          if(xhr.readyState == 4 && xhr.status == 200) {
              callback(JSON.parse(xhr.responseText));
          }
      }
      xhr.send();
    });
  }

  httpHelper.parseAuthorizationCookie = function(callback){
    const cookieDetails = { name: 'id_token', domain: 'herokuapp.com' };
    chrome.cookies.getAll(cookieDetails, function(cookie) {
        if (cookie.length === 0) {
            return;
        }
        const authToken = 'JWT ' + cookie[0].value;
        callback(authToken);
    });
  }

module.exports = httpHelper;
