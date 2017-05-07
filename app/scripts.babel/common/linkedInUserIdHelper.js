var linkedInUserIdHelper = {};

linkedInUserIdHelper.parse = function(url, callback){
    var parsedUrl = parse_url(url);
    var parts = parsedUrl.path.split("/");
    if(parsedUrl.authority === "www.linkedin.com" && parts[1] === "in"){
      callback(parts[2]);
    }else{
      callback();
    }
}


function parse_url(url) {
        var pattern = RegExp("^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?");
        var matches =  url.match(pattern);
        return {
            scheme: matches[2],
            authority: matches[4],
            path: matches[5],
            query: matches[7],
            fragment: matches[9]
        };
    }

module.exports = linkedInUserIdHelper;
