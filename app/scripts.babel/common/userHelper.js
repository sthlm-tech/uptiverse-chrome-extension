import jwtDecode from "jwt-decode";
var userHelper = {};

userHelper.UserInfo = function(callback){
  const cookieDetails = { name: "id_token", domain: "herokuapp.com" };
  chrome.cookies.getAll(cookieDetails, (cookie) => {
      const token = cookie[0];
      if (token.value) {
          var user = jwtDecode(token.value);
          callback(user);
      }
  });
}

module.exports = userHelper;
