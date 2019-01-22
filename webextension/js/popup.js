var tree;
var db;

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
    url: "https://cors.sboulema.nl/" + url,
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
    url: "https://cors.sboulema.nl/" + url,
    success: function(data) {
      var desc = $(data).find('meta[name=description]').attr("content");
      if (typeof desc === 'undefined') {
        desc = "";
      }
      callback(desc);
    }
  });
}

function loadBookmarks(callback) {
  loadFromFirebase(function(data){callback(data)});
}

function save(element) {
  saveToFirebase(element);
  // window.close();
}

function saveToFirebase(element) {
  var firebaseCode = localStorage.getItem("firebaseCode");

  // undefined is not a valid value to save in FireStore
  $.each(element, function (index, collection) {
      if (collection.parentId === undefined) {
          collection.parentId = -1;
      }
  });

  if (firebaseCode === null || firebaseCode === "") {   
    db.collection("bookmarks").add({
        bookmarks: element
    })
    .then(function(docRef) {
        localStorage.setItem("firebaseCode", docRef.id);
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });
  }
  else {
    console.log("Saving document");

    db.collection("bookmarks").doc(firebaseCode).set({
        bookmarks: element
    })
    .then(function(docRef) {
        console.log("Saved document!")
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });
  }
}

function loadFromFirebase(callback) {
    var firebaseCode = localStorage.getItem("firebaseCode");
    if (firebaseCode === null || firebaseCode === "") return;

    var docRef = db.collection("bookmarks").doc(firebaseCode);
    
    docRef.get().then(function(doc) {
        if (doc.exists) {
            callback(doc.data().bookmarks);
        } else {
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}

// Get the data from the selected node
function getSelectedCollection() {
  var id = tree.getSelections()[0];
  return tree.getDataById(id);
}

function addBookmark() {
  loadBookmarks(function(data) {
    $("#addSpan").empty();
    $("#addSpan").addClass("fa fa-spinner fa-spin");

    var selectedCollection = getSelectedCollection();
    if (selectedCollection === null) {
      selectedCollection = tree.getDataByText("Unsorted");
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
          if (typeof selectedCollection.bookmarks == 'undefined') {
            selectedCollection.bookmarks = [];
          }

          var bookmark = {
            text: title,
            url: url,
            description: desc,
            icon: "https://favicon.sboulema.nl/favicon?url=" + (new URL(url)).hostname
          };

          selectedCollection.bookmarks.push(bookmark);

          save(tree.getAll());

          $("#addSpan").removeClass();
          $("#addSpan").text("Saved!")
        });
      });
    });
  });
}

function createCollectionDropdown() {
  $("#collectionHeader").hide();
  loadBookmarks(function(data) {
    tree = $('#tree').tree({
      uiLibrary: 'bootstrap4',
      dataSource: data,
      primaryKey: 'nodeId',
      childrenField: 'nodes',
      border: true,
      imageCssClassField: 'icon',
      iconsLibrary: 'fontawesome',
      icons: {
          expand: '<i class="fal fa-folder"></i>',
          collapse: '<i class="fal fa-folder-open"></i>'
      }
    });
    tree.collapseAll();
    $("#collectionHeader").show();
  });
}

function login() {
  localStorage.setItem("firebaseCode", $("#syncCode").val());

  $("#login").hide();
  $("#add").show();
  createCollectionDropdown();
}

function initFirebase() {
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyD_5zP59NL_S0PBuNNjfpex-m_4e3q9zNE",
    authDomain: "linky-5cb10.firebaseapp.com",
    databaseURL: "https://linky-5cb10.firebaseio.com",
    projectId: "linky-5cb10",
    storageBucket: "linky-5cb10.appspot.com",
    messagingSenderId: "892580651576"
  };
  firebase.initializeApp(config);

  db = firebase.firestore();
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById("loginButton").onclick = login;
  document.getElementById("addButton").onclick = addBookmark;

  initFirebase();

  var code = localStorage.getItem("firebaseCode");
  if (code != null) {
    $("#login").hide();
    $("#add").show();
    createCollectionDropdown();
  } else {
    $("#login").show();
    $("#add").hide();
  }
});
