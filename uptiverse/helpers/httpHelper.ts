export default class HttpHelper {
    constructor() { }

    public executeRequest(url: string, requestType: string, requestData: any): Promise<any> {

        return new Promise<any>((resolve, reject) => {
            const x = new XMLHttpRequest();

            const cookieDetails = { name: "id_token", domain: "uptiverse.herokuapp.com" };
            this.parseAuthorizationCookie().then((authToken: any) => {

                x.open(requestType, url);
                x.setRequestHeader("Authorization", authToken);
                x.setRequestHeader("Content-Type", "application/json");

                x.responseType = "json";
                x.onreadystatechange = () => {
                     switch (x.status) {
                        case 400:
                            reject("Bad request");
                            break;

                        case 401:
                            reject("Unauthorized");
                            break;

                        case 403:
                            reject("Forbidden");
                            break;
                        case 404:
                            reject("endpoint not found");
                            break;
                        case 405:
                            reject("Method not allowed");
                            break;
                        case 407:
                            reject("Proxy authentication required");
                            break;
                        case 408:
                            reject("Request timeout");
                            break;
                        case 409:
                            reject("Conflict");
                            break;
                        default:

                    }
                };
                x.onload = () => {

                    const response = x.response;

                    // validate response
                    if (!response) {
                        reject("No response from uptiverse service!");
                        return;
                    }

                    resolve(response);
                };
                x.onerror = () => { };

                if (requestData) {
                    x.send(JSON.stringify(requestData));
                } else {
                    x.send();
                }

            }, (errorMessage: string) => {
                reject(errorMessage);
            });

        });

    }

    private parseAuthorizationCookie(): Promise<any> {
        return new Promise<any>((resolve, reject) => {

            const cookieDetails = { name: "id_token", domain: "herokuapp.com" };
            chrome.cookies.getAll(cookieDetails, (cookie) => {

                if (cookie.length === 0) {
                    reject("Please log in to uptiverse first!");
                    return;
                }
                const authToken = "JWT " + cookie[0].value;
                resolve(authToken);
            });
        });

    }

}
