import * as jwtDecode from "jwt-decode";
import HttpHelper from "../../../uptiverse/helpers/httpHelper";
var RECRUIT_STATUS;
(function (RECRUIT_STATUS) {
    RECRUIT_STATUS[RECRUIT_STATUS["INTERESTING"] = 0] = "INTERESTING";
    RECRUIT_STATUS[RECRUIT_STATUS["CONTACTED"] = 1] = "CONTACTED";
    RECRUIT_STATUS[RECRUIT_STATUS["READY_FOR_INTERVIEW"] = 2] = "READY_FOR_INTERVIEW";
    RECRUIT_STATUS[RECRUIT_STATUS["GIVEN_OFFER"] = 3] = "GIVEN_OFFER";
    RECRUIT_STATUS[RECRUIT_STATUS["NOT_INTERESTING"] = 4] = "NOT_INTERESTING";
    RECRUIT_STATUS[RECRUIT_STATUS["INACTIVE"] = 5] = "INACTIVE";
})(RECRUIT_STATUS || (RECRUIT_STATUS = {}));
export default class RecruitService {
    constructor() {
        this.getCurrentRecruit = (callback) => {
            chrome.storage.local.get("recruit", (recruit) => {
                // Notify that we saved.
                console.log("Retrieving recruit from storage", recruit);
                return callback(recruit);
            });
        };
        this.getCurrentRecruitsComments = (callback) => {
            chrome.storage.local.get("comments", (comments) => {
                // Notify that we saved.
                console.log("Retrieving recruit comments from storage", comments);
                callback(comments);
            });
        };
        this.setCurrentRecruit = (recruit) => {
            chrome.storage.local.set({ "recruit": recruit }, () => {
                // Notify that we saved.
                console.log("Saving recruit to storage", recruit);
            });
        };
        this.setCurrentRecruitsComments = (comments, callback) => {
            chrome.storage.local.remove("");
            chrome.storage.local.set({ "comments": comments }, () => {
                // Notify that we saved.
                callback(comments);
            });
        };
        this.addCommentToStorage = (comment, callback) => {
            this.getCurrentRecruitsComments((comments) => {
                let commentsToAdd = comments.comments.push(comment);
                chrome.storage.local.set({ "comments": comments }, () => {
                    // Notify that we saved.
                    console.log("saving added comment to storage", comments);
                    callback(comments);
                });
            });
        };
        this.HttpHelper = new HttpHelper();
    }
    init(url) {
        chrome.browserAction.setBadgeText({ text: "" });
        this.getRecruit(url, (recruit) => {
            console.log("getting recruits");
            this.recruit = recruit;
            chrome.storage.local.set({ "recruit": this.recruit }, () => {
                // Notify that we saved.
                console.log("Recruit saved");
            });
            console.log(recruit);
            console.log(this.recruit);
            this.getRecruitComments(recruit, (comments) => {
                this.comments = comments;
                this.setCurrentRecruitsComments(comments, (data) => {
                    this.updateExtensionBadge();
                });
            }, (errorMessage) => { });
        }, (errorMessage) => { });
    }
    addComment(comment, callback) {
        this.getCurrentRecruit((recruit) => {
            this.extractUserInfo((user) => {
                console.log(user);
                let requestData = { "comment": { "user": user, "text": comment } };
                console.log(recruit.recruit);
                console.log(requestData);
                let requestUrl = "https://uptiverse-comments.herokuapp.com/comments/recruit-" + recruit.recruit._id;
                this.HttpHelper.executeRequest(requestUrl, "POST", requestData, (res) => {
                    console.log(res);
                    this.addCommentToStorage(res, (savedComments) => {
                        callback(savedComments);
                    });
                }, () => { });
            });
        });
    }
    updateExtensionBadge() {
        var badgeSettings = { backgroundColor: "" };
        this.getCurrentRecruit((recruit) => {
            recruit.recruit.status = RECRUIT_STATUS.GIVEN_OFFER;
            if (recruit.recruit.status) {
                switch (recruit.recruit.status) {
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
            this.getCurrentRecruitsComments((comments) => {
                if (comments) {
                    chrome.browserAction.setBadgeText({ text: comments.comments.length.toString() });
                }
            });
        });
    }
    extractUserInfo(callback) {
        var cookieDetails = { name: "id_token", domain: "herokuapp.com" };
        chrome.cookies.getAll(cookieDetails, (cookie) => {
            const token = cookie[0];
            if (token.value) {
                const user = jwtDecode(token.value);
                callback(user);
            }
        });
    }
    getRecruit(currentUrl, callback, errorCallback) {
        currentUrl = currentUrl.slice(0, -1);
        var searchUrl = "https://uptiverse-recruit.herokuapp.com/recruits/find";
        var requestData = { link: currentUrl };
        this.HttpHelper.executeRequest(searchUrl, "POST", requestData, (response) => {
            //check if there are matches
            if (response.recruits.length === 0) {
                errorCallback("No matches found :(");
                return;
            }
            callback(response.recruits[0]);
        }, errorCallback);
    }
    getRecruitComments(recruit, callback, errorCallback) {
        const searchUrl = "https://uptiverse-comments.herokuapp.com/comments/recruit-" + recruit._id;
        this.HttpHelper.executeRequest(searchUrl, "GET", undefined, (response) => {
            callback(response);
        }, errorCallback);
    }
}
//# sourceMappingURL=recruitService.js.map