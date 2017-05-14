import recruitService from './services/recruitService.js';
import commentService from './services/commentService.js';


  chrome.webNavigation.onCompleted.addListener(function(){
    const queryInfo = {
      active: true,
      currentWindow: true,
      status: "complete"
    };
    chrome.browserAction.setBadgeText({text: ""});
    chrome.tabs.query(queryInfo, function(tabs){
      const tab = tabs[0];
      if(tab){
        const url = tab.url;
        if (url) {
          recruitService.getRecruitId(url, function(recruitId){
            if(recruitId){
              var id = "recruit-" + recruitId;
              commentService.getComments(id,function(comments){
                chrome.browserAction.setBadgeText({text: comments.length.toString()});
              });
            }
          });

        }
      }
    });
  });
