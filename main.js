// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

//Some url constants
const facebookUrl = 'https://facebook.com/';
const linkedinUrl = 'https://linkedin.com/in/';

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

  chrome.tabs.query(queryInfo, function (tabs) {
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



/**
 * @param {string} currentUrl - the url of the current tab
 * @param {function(recruit)} callback - Called when a recruit is found
 * @param {function(string)} errorCallback - Called when a recruit is not found or when there are issues with the request.
 *   The callback gets a string that describes the failure reason.
 */
function getRecruitInfo(currentUrl, callback, errorCallback) {
  
  currentUrl = currentUrl.slice(0, -1);
  var searchUrl = 'https://uptiverse-recruit.herokuapp.com/recruits/find';

  var searchParams = { "link": currentUrl };


  var x = new XMLHttpRequest();

  var cookieDetails = { name: 'id_token', domain: 'herokuapp.com'};
  chrome.cookies.getAll(cookieDetails, function (cookie) {

    if (cookie.length === 0) {
      errorCallback("Please log in to uptiverse first!");
      return;
    }
    var authToken =  'JWT ' + cookie[0].value;

    x.open('POST', searchUrl);
    x.setRequestHeader('Authorization', authToken);
    x.setRequestHeader("Content-Type", "application/json");

    x.responseType = 'json';
    x.onload = function () {

      var response = x.response;
    
      //validate response
      if (!response || !response.recruits ) {
        errorCallback("No response from uptiverse service!");
        return;
      }

      //check if there are matches
      if (response.recruits.length === 0) {
        errorCallback("No matches found :(");
        return;
      }
      var firstResult = response.recruits[0];

      callback(firstResult);
    };
    x.onerror = function () {
      errorCallback('Network error.');
    };
    x.send(JSON.stringify(searchParams));
  

  });

}

/**
 * 
 * @param {string} statusText - the status text to be rendered
 */
function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

/**
 * 
 * @param {Object} connections 
 */
function renderLinks(connections) {
  removeElementsByClass('link');
  var linkArea = document.getElementById('linkArea');
  
  if (connections.linkedIn) {
    var linkedinLink = document.createElement('a');
    linkedinLink.className += 'link';
    linkedinLink.target = '_blank';
    linkedinLink.href = linkedinUrl + connections.linkedIn;
    linkedinLink.text = "LinkedIn";
    linkArea.appendChild(linkedinLink);
  }
  if (connections.facebook) {
    var facebookLink = document.createElement('a');
    facebookLink.className += 'link';
    facebookLink.target = '_blank';
    facebookLink.href = facebookUrl + connections.facebook;
    facebookLink.text = "Facebook";
    linkArea.appendChild(facebookLink);
  }
 }

/**
 * 
 * @param {string} classname - elements with this class name will be removed
 */
function removeElementsByClass(classname) {
   var elementsToRemove = document.getElementsByClassName(classname);
   for (var i = elementsToRemove.length - 1; 0 <= i; i--) {
      if (elementsToRemove[i] && elementsToRemove[i].parentElement) {
        elementsToRemove[i].parentElement.removeChild(elementsToRemove[i]);
    }
   }
}

/**
 * 
 * @param {Object[]} comments 
 */
function renderCommentElements(comments) {
  removeElementsByClass('comment');
  comments.sort((a, b) => a.date < b.date);
  comments.forEach(function (comment) {
    var mainElement = document.createElement('div');
    mainElement.className += 'comment';
    
    var commentMetadata = document.createElement('span');
    commentMetadata.className += 'commentMetadata';
    var date = new Date(comment.date);
    commentMetadata.innerText = comment.user + " - " + date.toLocaleDateString();
    

    var commentText = document.createElement('div');
    commentText.innerText = comment.text;

    mainElement.appendChild(commentMetadata);
    mainElement.appendChild(document.createElement('br'));
    mainElement.appendChild(commentText);
    mainElement.appendChild(document.createElement('br'));
    var commentArea = document.getElementById('comments');
    commentArea.appendChild(mainElement);
  });
  
}

/**
 * adding an event listener for when the dom is loaded (the dom of the extension)
 */
document.addEventListener('DOMContentLoaded', function () {

  //hook up an event listener to the Get info button
  document.querySelector('#submit').addEventListener('click', function (event) {
  
    getCurrentTabUrl(function (url) { 
      getRecruitInfo(url, function (recruit) {

        renderStatus(recruit.firstname + " " + recruit.lastname);
        renderLinks(recruit.connections);

        renderCommentElements(recruit.comments);
      

      }, function (errorMessage) {
        renderStatus(errorMessage);
      });

    });

  });

});


