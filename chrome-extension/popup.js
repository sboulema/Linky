function getCurrentTabUrl(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    var tab = tabs[0];
    var url = tab.url;
    callback(url);
  });
}

function getTitle(url, callback) {
  $.ajax({
    url: url,
    success: function(data) {
      var matches = data.match(/<title.*?>([\s\S]*?)<\/title>/);
      callback(matches[1].trim());                   
    }
  });
}

function getDescription(url, callback) {
  $.ajax({
    url: url,
    success: function(data) {
      var desc = $(data).find('meta[name=description]').attr("content");
      callback(desc);
    }
  });
}

function loadFromMyJson(callback) {
  var myJsonCode = localStorage.getItem("myJsonCode");
  $.ajax({
    url: myJsonCode,
    type: "GET",
    success: function (data) {
      callback(data);
    }
  });
}

function saveToMyJson(element) {
  var myJsonCode = localStorage.getItem("myJsonCode");
  $.ajax({
    url: myJsonCode,
    type: "PUT",
    data: JSON.stringify(element),
    contentType: " application/json; charset=utf-8",
    dataType: "json",
    success: function (data, textStatus, jqXHR) {
      console.log("Bookmark saved")
      window.close();
    },
    error: function (data, textStatus, jqXHR) {
      console.log(data);
    }
  });
}

function getUnsortedCollection(data) {
  for (i = 0; i < data.length; i++) { 
    if (data[i].text === "Unsorted") {
      return data[i];
    }
  } 
}

function addBookmark() {
  loadFromMyJson(function(data) {
    var unsortedCollection = getUnsortedCollection(data);

    if (typeof unsortedCollection == 'undefined') {
      unsortedCollection = {
        text: "Unsorted",
        bookmarks: [],
        icon: "fa fa-inbox"
      };
      data.push(unsortedCollection);
    }

    getCurrentTabUrl(function(url) {
      getTitle(url, function(title) {
        getDescription(url, function(desc) {
          unsortedCollection.bookmarks.push({
            text: title,
            url: url,
            description: desc,
            icon: "https://logo.clearbit.com/" + (new URL(url)).hostname
          });
          unsortedCollection.tags = [unsortedCollection.bookmarks.length];
          saveToMyJson(data);
        });
      });
    });
  });
}

function login() {
  var code = document.getElementById("syncCode").value;
  localStorage.setItem("myJsonCode", "https://api.myjson.com/bins/" + code);
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById("loginButton").onclick = login;
  document.getElementById("addButton").onclick = addBookmark;

  var code = localStorage.getItem("myJsonCode");
  if (code != null) {
    document.getElementById("login").style.display = 'none';
    document.getElementById("add").style.display = 'block';
  } else {
    document.getElementById("login").style.display = 'block';
    document.getElementById("add").style.display = 'none';
  }
});
