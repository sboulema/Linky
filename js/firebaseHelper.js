var db = firebase.firestore();

function saveToFirebase(element) {
    var firebaseCode = localStorage.getItem("firebaseCode");

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
        db.collection("bookmarks").doc(firebaseCode).set({
            bookmarks: element
        })
        .then(function(docRef) {
            // saved
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
    var file = event.target.files[0];

    if (file) {
        var r = new FileReader();
        r.onload = function (e) {
            var contents = e.target.result;
            saveToFirebase(contents);      
        }
        r.readAsText(file);
    } else {
        alert("Failed to load file");
    }
}