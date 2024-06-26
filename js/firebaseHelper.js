var db = firebase.firestore();

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
            $('#savingErrorToast').toast('show');
        });
    }
    else {
        db.collection("bookmarks").doc(firebaseCode).set({
            bookmarks: element
        })
        .then(function(docRef) {
            // saved
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
            $('#savingErrorToast').toast('show');
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

async function loadFromFirebaseAsync() {
    var firebaseCode = localStorage.getItem("firebaseCode");
    if (firebaseCode === null || firebaseCode === "") return;

    var docRef = db.collection("bookmarks").doc(firebaseCode);
    var doc = await docRef.get();

    return doc.data().bookmarks;
}

function deleteAllData() {
    localStorage.clear();
}

function getFirebaseCode() {
    return localStorage.getItem("firebaseCode"); 
}

function setFirebaseCode(code) {
    localStorage.setItem("firebaseCode", code);
}

function importData(event) { 
    var file = event.files[0];

    if (file) {
        var r = new FileReader();
        r.onload = function (e) {
            var contents = e.target.result;

            if (file.name.endsWith("html")) {
                contents = importHTML(contents);
            }

            saveToFirebase(contents);            
        }
        r.readAsText(file);
    } else {
        alert("Failed to load file");
    }
}

function exportJson(filename) {
    loadFromFirebase(function(data) {
        var file = new File([JSON.stringify(data)], filename, {type: "application/json;charset=utf-8"});
        saveAs(file);
    });
}

function exportHtml(html, filename) {
    var file = new File([html], filename, {type: "text/html;charset=utf-8"});
    saveAs(file);
}