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
      if (matches === null) {
        callback(url);
      } else {
        callback(matches[1].trim()); 
      }                      
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

function saveBookmark() {
  var nodes = [];        
  if ($('#tree').treeview('getEnabled').length > 0 && $('#tree').treeview('getEnabled')[0].id !== "tree") {
      nodes.push($('#tree').treeview('getNode', 0));
      $.merge(nodes, $('#tree').treeview('getSiblings', nodes[0]));
  }
  saveToMyJson(nodes);
}

function addBookmark() {
  loadFromMyJson(function(data) {
    $("#addSpan").empty();
    $("#addSpan").addClass("fa fa-spinner fa-spin");
    var nodeId;
    var selectedCollection = $('#tree').treeview('getSelected', nodeId)[0];
    if (selectedCollection === null) {
      selectedCollection = getUnsortedCollection(data);
    }

    if (typeof selectedCollection == 'undefined') {
      selectedCollection = {
        text: "Unsorted",
        bookmarks: [],
        icon: "fa fa-inbox"
      };
      data.push(selectedCollection);
    }

    getCurrentTabUrl(function(url) {
      getTitle(url, function(title) {
        getDescription(url, function(desc) {
          selectedCollection.bookmarks.push({
            text: title,
            url: url,
            description: desc,
            icon: "https://logo.clearbit.com/" + (new URL(url)).hostname
          });
          selectedCollection.tags = [selectedCollection.bookmarks.length];
          saveBookmark();
          $("#addSpan").removeClass();
          $("#addSpan").text("Saved!")
        });
      });
    });
  });
}

function createCollectionDropdown() {
  $("#collectionHeader").hide();
  loadFromMyJson(function(data) {
    $('#tree').treeview({
        data: data,
        collapseIcon: "fa fa-folder-open-o",
        expandIcon: "fa fa-folder-o",
        emptyIcon: "fa fa-folder-o"
    });
    $('#tree').treeview('collapseAll', { silent: true });
    $("#collectionHeader").show();
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
    createCollectionDropdown();
  } else {
    document.getElementById("login").style.display = 'block';
    document.getElementById("add").style.display = 'none';
  }
});
