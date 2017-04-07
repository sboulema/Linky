function saveToMyJson(element) {
    var myJsonCode = localStorage.getItem("myJsonCode");
    if (myJsonCode === null) {       
        $.ajax({
            url: "https://api.myjson.com/bins",
            type: "POST",
            data: JSON.stringify(element),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data, textStatus, jqXHR) {
                localStorage.setItem("myJsonCode", data.uri);
            }
        });
    }
    else {
        $.ajax({
            url: myJsonCode,
            type: "PUT",
            data: JSON.stringify(element),
            contentType: " application/json; charset=utf-8",
            dataType: "json",
            success: function (data, textStatus, jqXHR) {
                // saved
            }
        });
    }
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

function getMyJsonCode() {
    var myJsonCode = localStorage.getItem("myJsonCode");
    if (myJsonCode !== null) {
        return myJsonCode.split("/").pop();
    }  
}

function deleteAllData() {
    localStorage.clear();
}

function exportData(filename) {
    $.get(localStorage.getItem("myJsonCode"), function (data, textStatus, jqXHR) {
        downloadURI('data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data)), filename);
    });
}

function downloadURI(uri, name) {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    link.click();
}

function importData(element) {
    var file = element.files[0];

    if (file) {
        var r = new FileReader();
        r.onload = function (e) {
            var contents = e.target.result;

            $.ajax({
                url: "https://api.myjson.com/bins",
                type: "POST",
                data: contents,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data, textStatus, jqXHR) {
                    localStorage.setItem("myJsonCode", data.uri);
                }
            });        
        }
        r.readAsText(file);
    } else {
        alert("Failed to load file");
    }
}

function setMyJsonCode(code) {
    localStorage.setItem("myJsonCode", "https://api.myjson.com/bins/" + code);
}