/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 6);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jwt_decode__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jwt_decode___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jwt_decode__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__uptiverse_helpers_httpHelper__ = __webpack_require__(4);
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};


var RECRUIT_STATUS;
(function (RECRUIT_STATUS) {
    RECRUIT_STATUS[RECRUIT_STATUS["INTERESTING"] = 0] = "INTERESTING";
    RECRUIT_STATUS[RECRUIT_STATUS["CONTACTED"] = 1] = "CONTACTED";
    RECRUIT_STATUS[RECRUIT_STATUS["READY_FOR_INTERVIEW"] = 2] = "READY_FOR_INTERVIEW";
    RECRUIT_STATUS[RECRUIT_STATUS["GIVEN_OFFER"] = 3] = "GIVEN_OFFER";
    RECRUIT_STATUS[RECRUIT_STATUS["NOT_INTERESTING"] = 4] = "NOT_INTERESTING";
    RECRUIT_STATUS[RECRUIT_STATUS["INACTIVE"] = 5] = "INACTIVE";
})(RECRUIT_STATUS || (RECRUIT_STATUS = {}));
class RecruitService {
    constructor() {
        this.HttpHelper = new __WEBPACK_IMPORTED_MODULE_1__uptiverse_helpers_httpHelper__["a" /* default */]();
    }
    init(url) {
        return new Promise((resolve, reject) => {
            chrome.browserAction.setBadgeText({ text: "" });
            this.getRecruit(url).then((response) => {
                // check if there are matches
                if (response.recruits.length === 0) {
                    reject(response);
                }
                this.recruit = response.recruits[0];
                this.getRecruitComments(this.recruit, (comments) => {
                    this.comments = comments;
                    this.updateExtensionBadge(this.recruit, comments);
                }, (errorMessage) => {
                    reject(errorMessage);
                });
            });
        });
    }
    addComment(url, comment) {
        return new Promise((resolve, reject) => {
            this.getCurrentRecruit(url).then((recruit) => {
                this.extractUserInfo().then((user) => {
                    const requestData = { comment: { user: user, text: comment } };
                    const requestUrl = "https://uptiverse-comments.herokuapp.com/comments/recruit-" + recruit._id;
                    this.HttpHelper.executeRequest(requestUrl, "POST", requestData).then((response) => {
                        resolve(response);
                    }, () => {
                        reject("Couldn't get comments");
                    });
                })
                    .catch((errormessage) => {
                    reject(errormessage);
                });
            });
        });
    }
    addRecruit(recruit) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            recruit.createdBy = yield this.extractUserInfo();
            if (!recruit.createdBy) {
                reject("could not retrieve user info");
            }
            const newRecruit = { recruit: recruit };
            const endpointUrl = "https://uptiverse-recruit.herokuapp.com/recruits/create";
            this.HttpHelper.executeRequest(endpointUrl, "POST", newRecruit).then((response) => {
                resolve(recruit);
            }).catch((errormessage) => {
                reject(errormessage);
            });
        }));
    }
    getCurrentRecruit(url) {
        return new Promise((resolve, reject) => {
            this.getRecruit(url).then((response) => {
                if (response.recruits.length === 0) {
                    resolve(response);
                }
                this.recruit = response.recruits[0];
                resolve(this.recruit);
            }).catch((errorMessage) => {
                reject(errorMessage);
            });
        });
    }
    getCurrentRecruitsComments(recruit) {
        return new Promise((resolve, reject) => {
            this.getRecruitComments(recruit, (comments) => {
                this.comments = comments;
                this.updateExtensionBadge(recruit, comments);
                resolve(comments);
            }, (errorMessage) => {
                reject(errorMessage);
            });
        });
    }
    updateExtensionBadge(recruit, comments) {
        const badgeSettings = { backgroundColor: "" };
        recruit.status = RECRUIT_STATUS.GIVEN_OFFER;
        if (recruit.status) {
            switch (recruit.status) {
                case RECRUIT_STATUS.INTERESTING:
                    badgeSettings.backgroundColor = "blue";
                    break;
                case RECRUIT_STATUS.CONTACTED:
                    badgeSettings.backgroundColor = "purple";
                    break;
                case RECRUIT_STATUS.READY_FOR_INTERVIEW:
                    badgeSettings.backgroundColor = "green";
                    break;
                case RECRUIT_STATUS.GIVEN_OFFER:
                    badgeSettings.backgroundColor = "orange";
                    break;
                case RECRUIT_STATUS.NOT_INTERESTING:
                    badgeSettings.backgroundColor = "red";
                    break;
                case RECRUIT_STATUS.INACTIVE:
                    badgeSettings.backgroundColor = "gray";
                    break;
                default:
                    badgeSettings.backgroundColor = "black";
            }
            chrome.browserAction.setBadgeBackgroundColor({ color: badgeSettings.backgroundColor });
        }
        if (comments) {
            chrome.browserAction.setBadgeText({ text: comments.length.toString() });
        }
    }
    extractUserInfo() {
        return new Promise((resolve, reject) => {
            let user;
            const cookieDetails = { name: "id_token", domain: "herokuapp.com" };
            chrome.cookies.getAll(cookieDetails, (cookie) => {
                const token = cookie[0];
                if (token.value) {
                    user = __WEBPACK_IMPORTED_MODULE_0_jwt_decode__(token.value);
                    resolve(user);
                }
                else {
                    reject(user);
                }
            });
        });
    }
    getRecruit(currentUrl) {
        return new Promise((resolve, reject) => {
            currentUrl = currentUrl.slice(0, -1);
            const searchUrl = "https://uptiverse-recruit.herokuapp.com/recruits/find";
            const requestData = { link: currentUrl };
            this.HttpHelper.executeRequest(searchUrl, "POST", requestData).then((response) => {
                resolve(response);
            }, (errormessage) => {
                reject(errormessage);
            });
        });
    }
    getRecruitComments(recruit, callback, errorCallback) {
        const searchUrl = "https://uptiverse-comments.herokuapp.com/comments/recruit-" + recruit._id;
        this.HttpHelper.executeRequest(searchUrl, "GET", undefined).then((response) => {
            callback(response);
        }, errorCallback);
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = RecruitService;



/***/ }),
/* 1 */
/***/ (function(module, exports) {

/**
 * The code was extracted from:
 * https://github.com/davidchambers/Base64.js
 */

var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function InvalidCharacterError(message) {
  this.message = message;
}

InvalidCharacterError.prototype = new Error();
InvalidCharacterError.prototype.name = 'InvalidCharacterError';

function polyfill (input) {
  var str = String(input).replace(/=+$/, '');
  if (str.length % 4 == 1) {
    throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
  }
  for (
    // initialize result and counters
    var bc = 0, bs, buffer, idx = 0, output = '';
    // get next character
    buffer = str.charAt(idx++);
    // character found in table? initialize bit storage and add its ascii value;
    ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
      // and if not first of each 4 characters,
      // convert the first 8 bits to one ascii character
      bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
  ) {
    // try to find character in table (0-63, not found => -1)
    buffer = chars.indexOf(buffer);
  }
  return output;
}


module.exports = typeof window !== 'undefined' && window.atob && window.atob.bind(window) || polyfill;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

var atob = __webpack_require__(1);

function b64DecodeUnicode(str) {
  return decodeURIComponent(atob(str).replace(/(.)/g, function (m, p) {
    var code = p.charCodeAt(0).toString(16).toUpperCase();
    if (code.length < 2) {
      code = '0' + code;
    }
    return '%' + code;
  }));
}

module.exports = function(str) {
  var output = str.replace(/-/g, "+").replace(/_/g, "/");
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += "==";
      break;
    case 3:
      output += "=";
      break;
    default:
      throw "Illegal base64url string!";
  }

  try{
    return b64DecodeUnicode(output);
  } catch (err) {
    return atob(output);
  }
};


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var base64_url_decode = __webpack_require__(2);

function InvalidTokenError(message) {
  this.message = message;
}

InvalidTokenError.prototype = new Error();
InvalidTokenError.prototype.name = 'InvalidTokenError';

module.exports = function (token,options) {
  if (typeof token !== 'string') {
    throw new InvalidTokenError('Invalid token specified');
  }

  options = options || {};
  var pos = options.header === true ? 0 : 1;
  try {
    return JSON.parse(base64_url_decode(token.split('.')[pos]));
  } catch (e) {
    throw new InvalidTokenError('Invalid token specified: ' + e.message);
  }
};

module.exports.InvalidTokenError = InvalidTokenError;


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class HttpHelper {
    constructor() { }
    executeRequest(url, requestType, requestData) {
        return new Promise((resolve, reject) => {
            const x = new XMLHttpRequest();
            const cookieDetails = { name: "id_token", domain: "uptiverse.herokuapp.com" };
            this.parseAuthorizationCookie().then((authToken) => {
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
                }
                else {
                    x.send();
                }
            }, (errorMessage) => {
                reject(errorMessage);
            });
        });
    }
    parseAuthorizationCookie() {
        return new Promise((resolve, reject) => {
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
/* harmony export (immutable) */ __webpack_exports__["a"] = HttpHelper;



/***/ }),
/* 5 */,
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__uptiverse_recruit_services_recruitService__ = __webpack_require__(0);
// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

// Some url constants
const facebookUrl = "https://facebook.com/";
const linkedinUrl = "https://linkedin.com/in/";
document.addEventListener("DOMContentLoaded", () => {
    const m = new Main();
    const refreshButton = document.getElementById("refreshButton");
    refreshButton.addEventListener("click", () => {
        m.loadRecruit();
    });
    const commentButton = document.getElementById("addCommentButton");
    commentButton.addEventListener("click", () => {
        m.addComment();
    });
    const addRecruitButton = document.getElementById("addRecruitButton");
    addRecruitButton.addEventListener("click", () => {
        m.addRecruit();
    });
    m.loadRecruit();
});
class Main {
    constructor() {
        this.recruitService = new __WEBPACK_IMPORTED_MODULE_0__uptiverse_recruit_services_recruitService__["a" /* default */]();
    }
    addRecruit() {
        const firstNameInputFieldValue = document.getElementById("newrecruit-firstname").value;
        const lastNameInputFieldValue = document.getElementById("newrecruit-lastname").value;
        const connectionInputFieldValue = document.getElementById("newrecruit-connection").value;
        const idInputFieldValue = document.getElementById("newrecruit-id").value;
        if (!firstNameInputFieldValue || !lastNameInputFieldValue || !connectionInputFieldValue || !idInputFieldValue) {
            return;
        }
        const recruit = { id: idInputFieldValue, firstname: firstNameInputFieldValue, lastname: lastNameInputFieldValue, connection: connectionInputFieldValue };
        this.recruitService.addRecruit(recruit).then(() => {
            const addRecruitSection = document.getElementById("addRecruitSection");
            addRecruitSection.hidden = true;
            this.loadRecruit();
        }).catch((errormessage) => {
            this.renderStatus(errormessage);
        });
    }
    addComment() {
        return __awaiter(this, void 0, void 0, function* () {
            const comment = document.getElementById("commentField").value;
            const url = yield this.getCurrentTabUrl();
            this.recruitService.addComment(url, comment).then((comments) => {
                this.loadRecruit();
                document.getElementById("commentField").value = "";
            }).catch((errormessage) => {
                this.renderStatus(errormessage);
            });
        });
    }
    loadRecruit() {
        this.getCurrentTabUrl().then((url) => {
            this.recruitService.getCurrentRecruit(url).then((recruit) => {
                if (!recruit.connections) {
                    const commentSection = document.getElementById("commentSection");
                    commentSection.hidden = true;
                    const addRecruitSection = document.getElementById("addRecruitSection");
                    addRecruitSection.hidden = false;
                    const connectionInputField = document.getElementById("newrecruit-connection");
                    connectionInputField.value = recruit.source;
                    const idInputField = document.getElementById("newrecruit-id");
                    idInputField.value = recruit.id;
                }
                else {
                    this.renderStatus(recruit.firstname + " " + recruit.lastname);
                    this.renderLinks(recruit.connections);
                    this.recruitService.getCurrentRecruitsComments(recruit).then((comments) => {
                        if (comments) {
                            this.renderCommentElements(comments);
                        }
                    });
                }
            }).catch((errormessage) => {
                this.renderStatus(errormessage);
            });
        });
    }
    getCurrentTabUrl() {
        return new Promise((resolve, reject) => {
            const queryInfo = { active: true, currentWindow: true };
            chrome.tabs.query(queryInfo, (tabs) => {
                // chrome.tabs.query invokes the callback with a list of tabs that match the
                // query. When the popup is opened, there is certainly a window and at least
                // one tab, so we can safely assume that |tabs| is a non-empty array.
                // A window can only have one active tab at a time, so the array consists of
                // exactly one tab.
                const tab = tabs[0];
                // A tab is a plain object that provides information about the tab.
                // See https://developer.chrome.com/extensions/tabs#type-Tab
                const url = tab.url;
                // tab.url is only available if the "activeTab" permission is declared.
                // If you want to see the URL of other tabs (e.g. after removing active:true
                // from |queryInfo|), then the "tabs" permission is required to see their
                // "url" properties.
                console.assert(typeof url === "string", "tab.url should be a string");
                if (url) {
                    resolve(url);
                }
                else {
                    reject("current url is undefined");
                }
            });
        });
    }
    /**
     *
     * @param {string} statusText - the status text to be rendered
     */
    renderStatus(statusText) {
        document.getElementById("status").textContent = statusText;
    }
    /**
     *
     * @param connections
     */
    renderLinks(connections) {
        this.removeElementsByClass("link");
        const linkArea = document.getElementById("linkArea");
        if (connections.linkedIn) {
            const linkedinLink = document.createElement("a");
            linkedinLink.className += "link";
            linkedinLink.target = "_blank";
            linkedinLink.href = linkedinUrl + connections.linkedIn;
            linkedinLink.text = "LinkedIn";
            linkArea.appendChild(linkedinLink);
        }
        if (connections.facebook) {
            const facebookLink = document.createElement("a");
            facebookLink.className += "link";
            facebookLink.target = "_blank";
            facebookLink.href = facebookUrl + connections.facebook;
            facebookLink.text = "Facebook";
            linkArea.appendChild(facebookLink);
        }
    }
    /**
     *
     * @param {string} classname - elements with this class name will be removed
     */
    removeElementsByClass(classname) {
        const elementsToRemove = document.getElementsByClassName(classname);
        for (let i = elementsToRemove.length - 1; 0 <= i; i--) {
            if (elementsToRemove[i] && elementsToRemove[i].parentElement) {
                elementsToRemove[i].parentElement.removeChild(elementsToRemove[i]);
            }
        }
    }
    /**
     *
     * @param {Object[]} comments
     */
    renderCommentElements(comments) {
        this.removeElementsByClass("comment");
        if (!comments || comments.length === 0) {
            return;
        }
        comments.sort((a, b) => a.date > b.date);
        comments.forEach((comment) => {
            const mainElement = document.createElement("div");
            mainElement.className += "comment";
            const commentMetadata = document.createElement("span");
            commentMetadata.className += "commentMetadata";
            const date = new Date(comment.date);
            commentMetadata.innerText = comment.user.name.firstname + " " + comment.user.name.lastname + " - " + date.toLocaleDateString();
            const commentText = document.createElement("div");
            commentText.innerText = comment.text;
            mainElement.appendChild(commentMetadata);
            mainElement.appendChild(document.createElement("br"));
            mainElement.appendChild(commentText);
            mainElement.appendChild(document.createElement("br"));
            const commentArea = document.getElementById("comments");
            commentArea.appendChild(mainElement);
        });
    }
}


/***/ })
/******/ ]);