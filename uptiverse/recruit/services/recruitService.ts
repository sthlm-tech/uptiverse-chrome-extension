import * as jwtDecode from "jwt-decode";
import HttpHelper from "../../../uptiverse/helpers/httpHelper";
import { IRecruit } from "../models/IRecruit";
import { IUptiverseUser } from "../models/IUptiverseUser";

enum RECRUIT_STATUS {
    INTERESTING,
    CONTACTED,
    READY_FOR_INTERVIEW,
    GIVEN_OFFER,
    NOT_INTERESTING,
    INACTIVE}

export default class RecruitService {

    private recruit: IRecruit;
    private comments: [{}];

    private HttpHelper: HttpHelper;
    constructor() {

        this.HttpHelper = new HttpHelper();
    }

    public init(url: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            chrome.browserAction.setBadgeText({ text: "" });

            this.getRecruit(url).then((response) => {
                // check if there are matches
                if (response.recruits.length === 0) {
                    reject(response);
                }
                this.recruit = response.recruits[0];

                this.getRecruitComments(this.recruit, (comments: any) => {

                    this.comments = comments;
                    this.updateExtensionBadge(this.recruit, comments);

                }, (errorMessage: any) => {
                    reject(errorMessage);
                });
            });
        });

    }

    public addComment(url: string, comment: string): Promise<[string]> {
        return new Promise<[string]>((resolve, reject) => {

            this.getCurrentRecruit(url).then((recruit: any) => {

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

    public addRecruit(recruit: IRecruit): Promise<IRecruit> {
        return new Promise<IRecruit>(async (resolve, reject) => {
            recruit.createdBy = await this.extractUserInfo();
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

        });

    }

    public getCurrentRecruit(url: string): Promise<object> {
        return new Promise<object>((resolve, reject) => {
            this.getRecruit(url).then((response: any) => {
                if (response.recruits.length === 0) {
                    resolve(response);
                }
                this.recruit = response.recruits[0];
                resolve(this.recruit);

            }).catch((errorMessage: any) => {
                reject(errorMessage);
            });

        });

    }

    public getCurrentRecruitsComments(recruit): Promise<[object]> {
        return new Promise<[object]>((resolve, reject) => {
            this.getRecruitComments(recruit, (comments: any) => {

                this.comments = comments;
                this.updateExtensionBadge(recruit, comments);
                resolve(comments);

            }, (errorMessage: any) => {
                reject(errorMessage);
            });
        });

    }

    private updateExtensionBadge(recruit: IRecruit, comments: [{}]) {

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

    private extractUserInfo(): Promise<IUptiverseUser> {
        return new Promise<IUptiverseUser>((resolve, reject) => {
            let user: IUptiverseUser;
            const cookieDetails = { name: "id_token", domain: "herokuapp.com" };
            chrome.cookies.getAll(cookieDetails, (cookie) => {
                const token = cookie[0];
                if (token.value) {
                    user = jwtDecode(token.value);
                    resolve(user);
                } else {
                    reject(user);
                }

            });
        });

    }

    private getRecruit(currentUrl: string): Promise<any> {
        return new Promise<object>((resolve, reject) => {

            currentUrl = currentUrl.slice(0, -1);
            const searchUrl = "https://uptiverse-recruit.herokuapp.com/recruits/find";

            const requestData = { link: currentUrl };
            this.HttpHelper.executeRequest(searchUrl, "POST", requestData).then((response: any) => {

                resolve(response);
            }, (errormessage) => {
                reject(errormessage);
            });
        });

    }

    private getRecruitComments(recruit: any, callback: any, errorCallback: any) {

        const searchUrl = "https://uptiverse-comments.herokuapp.com/comments/recruit-" + recruit._id;

        this.HttpHelper.executeRequest(searchUrl, "GET", undefined).then((response) => {

            callback(response);

        }, errorCallback);

    }

}
