var db;

function initFirebase() {
    var config = {
      apiKey: "{firebaseApiKey}",
      authDomain: "linky-5cb10.firebaseapp.com",
      databaseURL: "https://linky-5cb10.firebaseio.com",
      projectId: "linky-5cb10",
      storageBucket: "linky-5cb10.appspot.com",
      messagingSenderId: "892580651576"
    };
    firebase.initializeApp(config);
  
    db = firebase.firestore();
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

function saveToFirebase(element) {
    var firebaseCode = localStorage.getItem("firebaseCode");
  
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

function addBookmark(url) {
    loadBookmarks(function(data) {
        var collection = data.find(c => c.text === 'Unsorted');
  
        if (typeof collection == 'undefined') {
            collection = {
                text: "Unsorted",
                bookmarks: [],
                icon: "fa fa-inbox"
            };
            data.push(collection);
        };
  
        getTitle(url, function(title) {
            getDescription(url, function(desc) {  
                var bookmark = {
                    text: title,
                    url: url,
                    description: desc,
                    icon: "https://favicon.sboulema.nl/favicon?url=" + url
                };

                collection.bookmarks.push(bookmark);

                saveToFirebase(data);
            });
        });
    });
}

window.addEventListener('DOMContentLoaded', () => {
    const parsedUrl = new URL(window.location);
    
    var text = parsedUrl.searchParams.get('text');

    initFirebase();

    addBookmark(text);
});  