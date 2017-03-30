// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });

}




var dummyResponseData = {"source":"name",
"recruits":[
  {"_id":"58433f51602e9b312ca2ac6a","lastname":"Dahlstrand","firstname":"Ulf","searchableName":"ulf dahlstrand",
  "comments":[
    {"user":"ulf.dahlstrand","date":"2016-12-07T16:40:12.416Z","text":"Detta är en test kommentar"},
    {"user":"ulf.dahlstrand","date":"2016-12-16T16:40:12.416Z","text":"dfgsdfgdsf sdf dfg dfs g fdfd faeewr erew we w ew rwe r wer we rw fds sad fasd fasd fas dfdsa ds ds ds dfgsdfgdsf sdf dfg dfs g fdfd faeewr erew we w ew rwe r wer we rw fds sad fasd fasd fas dfdsa ds ds ds "}]
  ,"__v":0,
  "connections":{"linkedIn":"ulfdavidsson","facebook":"ulf.davidsson"}}]}
/**
 * @param {string} currentUrl - the url of the current tab
 * @param {function(recruit)} callback - Called when a recruit is found
 * @param {function(string)} errorCallback - Called when a recruit is not found or when there are issues with the request.
 *   The callback gets a string that describes the failure reason.
 */
function getRecruitInfo(currentUrl, callback, errorCallback) {
  
  currentUrl = currentUrl.slice(0, -1);
  
  var searchUrl = 'https://uptiverse-recruit.herokuapp.com/recruits/find';

  var searchParams = {"link": currentUrl};


  var x = new XMLHttpRequest();
  x.open('POST', searchUrl);
  x.setRequestHeader('Authorization', 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjExMTE3ODgzMDU5NTU2MTU4MTkwNiIsImVtYWlsIjoib3NrYXIubGFyc3NvbkB1cHRpdmUuc2UiLCJ1c2VybmFtZSI6Im9za2FyLmxhcnNzb24iLCJuYW1lIjp7ImZpcnN0bmFtZSI6Im9za2FyIiwibGFzdG5hbWUiOiJsYXJzc29uIn0sImlhdCI6MTQ5MDg1ODg5MCwiZXhwIjoxNTA2NDEwODkwfQ.nCjIXO3ydSDbOVsFfFLyC0Y9Pxji3DuRVYGH2zJ-PxQ');
  x.setRequestHeader("Content-Type", "application/json");

  x.responseType = 'json';
  x.onload = function() {
    // Parse and process the response from uptiverse
    var response = x.response;
    
    //validate response
    if (!response || !response.recruits ) {
      errorCallback('No response from uptiverse service!');
      return;
    }

    //check if there are matches
    if (response.recruits.length === 0) {
      errorCallback('No matches found :(');
      return;
    }
    var firstResult = response.recruits[0];

    callback(firstResult);
  };
  x.onerror = function() {
    errorCallback('Network error.');
  };
  x.send(JSON.stringify(searchParams));
}

function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

function clearCommentArea() {
   var commentArea = document.getElementById('comments');

   var comments = document.getElementsByClassName('comment');
   for(var i = comments.length - 1; 0 <= i; i--){
      if(comments[i] && comments[i].parentElement){
        comments[i].parentElement.removeChild(comments[i]);
      }
   }

   
   //commentArea.removeChild(commentArea.getElementsByClassName('comment'));
}

function renderCommentElement(comment) {
  
  var mainElement = document.createElement("div");
  mainElement.className += 'comment';
  var commentMetadata = document.createElement("span");
  var date = new Date(comment.date);
  commentMetadata.innerText = comment.user + ' - ' + date.toLocaleDateString();
  commentMetadata.className += 'commentMetadata';

  var commentText = document.createElement("span");
  commentText.innerText = comment.text;



  mainElement.appendChild(commentMetadata);
  mainElement.appendChild(document.createElement("br"));
  mainElement.appendChild(commentText);
  mainElement.appendChild(document.createElement("br"));
  var commentArea = document.getElementById('comments');
  commentArea.appendChild(mainElement);
}

document.addEventListener('DOMContentLoaded', function() {


document.querySelector('#submit').addEventListener('click', function(event) {
  
  getCurrentTabUrl(function(url) { 
    getRecruitInfo(url, function(recruit){

        renderStatus(recruit.firstname + ' ' + recruit.lastname);
        recruit.comments.sort((a, b) => a.date < b.date);
        clearCommentArea();
        recruit.comments.forEach(function (comment) {
          renderCommentElement(comment)
        });

    }, function(errorMessage) {
      renderStatus('Cannot display image. ' + errorMessage);
    });
    
  
    
  });

});

});


