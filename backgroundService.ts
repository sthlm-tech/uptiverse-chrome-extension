/// <reference path="node_modules/@types/chrome/index.d.ts"/>

import RecruitService from "./uptiverse/recruit/services/recruitService";

chrome.webNavigation.onCompleted.addListener(() => {
    const queryInfo = {
        active: true,
        currentWindow: true,
        status: "complete"};

    const rs: RecruitService = new RecruitService();
    chrome.tabs.query(queryInfo, (tabs) => {

        const tab = tabs[0];
        const url: string = tab.url;

        chrome.browserAction.setBadgeText({ text: "" });
        if (url.toLowerCase().indexOf("linkedin.com/in") > -1) {
            rs.init(url).then((response) => {});
        }

    });
});
