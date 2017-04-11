export default class HttpHelper {
    constructor() { }
    executeRequest(url, requestType, requestData, callback, errorCallback) {
        var x = new XMLHttpRequest();
        var cookieDetails = { name: "id_token", domain: "uptiverse.herokuapp.com" };
        this.parseAuthorizationCookie((authToken) => {
            x.open(requestType, url);
            x.setRequestHeader("Authorization", authToken);
            x.setRequestHeader("Content-Type", "application/json");
            x.responseType = "json";
            x.onload = () => {
                const response = x.response;
                //validate response
                if (!response) {
                    errorCallback("No response from uptiverse service!");
                    return;
                }
                callback(response);
            };
            x.onerror = () => {
                errorCallback("Network error.");
            };
            if (requestData) {
                x.send(JSON.stringify(requestData));
            }
            else {
                x.send();
            }
        }, (errorMessage) => {
            console.log(errorMessage);
        });
    }
    parseAuthorizationCookie(callback, errorCallback) {
        var cookieDetails = { name: "id_token", domain: "herokuapp.com" };
        chrome.cookies.getAll(cookieDetails, (cookie) => {
            if (cookie.length === 0) {
                errorCallback("Please log in to uptiverse first!");
                return;
            }
            const authToken = "JWT " + cookie[0].value;
            callback(authToken);
        });
    }
}
//# sourceMappingURL=httpHelper.js.map