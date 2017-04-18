// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import RecruitService from "./uptiverse/recruit/services/recruitService";

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

    private recruitService: RecruitService;
    constructor() {
        this.recruitService = new RecruitService();
    }

    public addRecruit() {
        const firstNameInputFieldValue = (document.getElementById("newrecruit-firstname") as HTMLInputElement).value;
        const lastNameInputFieldValue = (document.getElementById("newrecruit-lastname") as HTMLInputElement).value;

        const connectionInputFieldValue = (document.getElementById("newrecruit-connection") as HTMLInputElement).value;
        const idInputFieldValue = (document.getElementById("newrecruit-id") as HTMLInputElement).value;

        if (!firstNameInputFieldValue || !lastNameInputFieldValue || !connectionInputFieldValue || !idInputFieldValue) {
            return;
        }

        const recruit = { id: idInputFieldValue, firstname: firstNameInputFieldValue, lastname: lastNameInputFieldValue, connection: connectionInputFieldValue };
        this.recruitService.addRecruit(recruit).then(() => {
            const addRecruitSection = document.getElementById("addRecruitSection") as HTMLDivElement;
            addRecruitSection.hidden = true;
            this.loadRecruit();

        }).catch((errormessage) => {
            this.renderStatus(errormessage);

        });

    }

    public async addComment() {
        const comment = (document.getElementById("commentField") as HTMLInputElement).value;

        const url = await this.getCurrentTabUrl();

        this.recruitService.addComment(url, comment).then((comments) => {
            this.loadRecruit();
            (document.getElementById("commentField") as HTMLInputElement).value = "";
        }).catch((errormessage) => {
            this.renderStatus(errormessage);
        });
    }

    public loadRecruit() {

        this.getCurrentTabUrl().then((url: string) => {
            this.recruitService.getCurrentRecruit(url).then((recruit: any) => {
                if (!recruit.connections) {
                    const commentSection = document.getElementById("commentSection") as HTMLDivElement;
                    commentSection.hidden = true;

                    const addRecruitSection = document.getElementById("addRecruitSection") as HTMLDivElement;
                    addRecruitSection.hidden = false;

                    const connectionInputField = document.getElementById("newrecruit-connection") as HTMLInputElement;
                    connectionInputField.value = recruit.source;

                    const idInputField = document.getElementById("newrecruit-id") as HTMLInputElement;
                    idInputField.value = recruit.id;

                    this.getCurrentTabTitle().then((title: string) => {
                      const firstNameInputField = (document.getElementById("newrecruit-firstname") as HTMLInputElement);
                      const lastNameInputField = (document.getElementById("newrecruit-lastname") as HTMLInputElement);
                      const names = this.getNameFromTitle(title).split(" ");
                      if(names.length >= 1){firstNameInputField.value = names[0];}
                      if(names.length >= 2){lastNameInputField.value = names[1];}
                    });

                } else {
                    this.renderStatus(recruit.firstname + " " + recruit.lastname);
                    this.renderLinks(recruit.connections);

                    this.recruitService.getCurrentRecruitsComments(recruit).then((comments: any) => {
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

    private getNameFromTitle(title: string): string {
      var name = title.replace("| LinkedIn","");
      name = name.trim();
      return name;
    }

    private getCurrentTabUrl(): Promise<string> {

        return new Promise<string>((resolve, reject) => {
            const queryInfo = {active: true, currentWindow: true};

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
                } else {
                    reject("current url is undefined");
                }
            });

        });

    }

    private getCurrentTabTitle(): Promise<string> {

        return new Promise<string>((resolve, reject) => {
            const queryInfo = {active: true, currentWindow: true};

            chrome.tabs.query(queryInfo, (tabs) => {
                const tab = tabs[0];
                const title = tab.title;
                console.assert(typeof title === "string", "tab.title should be a string");

                if (title) {
                    resolve(title);
                } else {
                    reject("current title is undefined");
                }
            });

        });

    }

    /**
     *
     * @param {string} statusText - the status text to be rendered
     */
    private renderStatus(statusText: string) {
        document.getElementById("status").textContent = statusText;
    }

    /**
     *
     * @param connections
     */
    private renderLinks(connections: any) {
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
    private removeElementsByClass(classname: string) {
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
    private renderCommentElements(comments: any) {
        this.removeElementsByClass("comment");
        if (!comments || comments.length === 0) {
            return;
        }
        comments.sort((a: any, b: any) => a.date > b.date);
        comments.forEach((comment: any) => {
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
