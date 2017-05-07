import recruitService from './services/recruitService.js';

window.onload = function() {
  document.querySelector('#contentFrame').onload = function() {
    document.querySelector('#loadingContainer').style.visibility = 'hidden';
  };
  const queryInfo = {active: true, currentWindow: true};

  chrome.tabs.query(queryInfo, (tabs) => {
      const tab = tabs[0];
      const url = tab.url;
      const title = tab.title;
      if (url) {
        recruitService.getRecruit(url, function(result){
          if(result && result.recruits.length){
            loadRecruitPage(result.recruits[0]._id);
          }else{
            loadAddRecruitPage(parseNameFromTitle(title), result);
          }
        });
      }
  });

  function loadRecruitPage(id){
    document.querySelector('#loadingContainer').style.visibility = 'visible';
    document.querySelector('#addRecruitSection').style.display = 'none';
    document.querySelector('#contentFrame').src = 'http://uptiverse.herokuapp.com/recruit/' + id;
  }


  function loadAddRecruitPage(name, result){
    document.querySelector('#loadingContainer').style.visibility = 'hidden';
    document.querySelector('#addRecruitSection').style.display = 'block';
    var button = document.querySelector('#addRecruitButton')
    button.addEventListener("click", function() {
      var recruit = {
        firstname: name.firstname,
        lastname: name.lastname,
        connection: result.source,
        id: result.id
      };
      recruitService.createRecruit(recruit, function(result){
        loadRecruitPage(result._id);
      });
    }, false);
  }

  function parseNameFromTitle(title){
    var name = title.replace('| LinkedIn','');
    name = name.trim();
    const names = name.split(' ');
    return {
      firstname: names.length > 0 ? names[0] : '',
      lastname: names.length > 1 ? names[1] : '',
    };
  }
}
