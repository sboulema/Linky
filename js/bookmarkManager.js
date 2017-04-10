function addCollection() {
    var nodeId;
    var selectedCollection = $('#tree').treeview('getSelected', nodeId)[0];

    if (typeof selectedCollection == 'undefined' || selectedCollection.id === "tree") {
        selectedCollection = {text: $('#addCollectionName').val()};
        updateTree(selectedCollection);
    } else {
        if (typeof selectedCollection.nodes == 'undefined') {
            selectedCollection.nodes = [];
        }

        selectedCollection.nodes.push({text: $('#addCollectionName').val()});
        updateTree();
    }      

    $('#addCollectionName').val("");
}

function addBookmark() {
    var nodeId;
    var selectedCollection = $('#tree').treeview('getSelected', nodeId)[0];

    if (typeof selectedCollection.bookmarks == 'undefined') {
        selectedCollection.bookmarks = [];
    }

    selectedCollection.bookmarks.push({
        text: $('#addBookmarkName').val(),
        url: $('#addBookmarkUrl').val(),
        icon: "http://www.google.com/s2/favicons?domain_url=" + $('#addBookmarkUrl').val()
    });

    $('#addBookmarkName').val("");
    $('#addBookmarkUrl').val("");

    selectedCollection.tags = [selectedCollection.bookmarks.length];

    updateTree();
}

function deleteBookmark(node) {
    var selectedCollection = getSelectedCollection();
    var bookmarkIndex = getIndex(node);

    selectedCollection.bookmarks.splice(bookmarkIndex, 1);

    updateTree();
    location.reload();
}

function deleteCollection() {
    var collection = getSelectedCollection();
    var index = getIndex(collection);
    var parent = $('#tree').treeview('getParent', collection)[0];

    if (parent.id === "tree") {
        var collections = getCollections();

        collections.splice(index, 1);

        updateTree(collections, true);
    } else {
        parent.nodes.slice(index, 1);

        updateTree();
    }
}

function editBookmark(node) {          
    var bookmark = getSelectedBookmark(node);
    var bookmarkIndex = getIndex(node);

    $("#editName").val(bookmark.text);
    $("#editUrl").val(bookmark.url);
    $("#editIcon").val(bookmark.icon);
    $("#editIndex").text(bookmarkIndex);
    $('#editModal').modal('show');
}

function editCollection() {
    var selectedCollection = getSelectedCollection();

    $("#editCollectionName").val(selectedCollection.text);
    $("#editCollectionIcon").val(selectedCollection.icon);
    $('#editCollectionModal').modal('show');
}

function saveBookmark() {
    var selectedCollection = getSelectedCollection();
    var bookmarkIndex = parseInt($("#editIndex").text());

    selectedCollection.bookmarks[bookmarkIndex].text = $("#editName").val();
    selectedCollection.bookmarks[bookmarkIndex].url = $("#editUrl").val();
    selectedCollection.bookmarks[bookmarkIndex].icon = $("#editIcon").val();

    updateTree();
}

function saveCollection() {
    var selectedCollection = getSelectedCollection();
    selectedCollection.text = $("#editCollectionName").val();
    selectedCollection.icon = $("#editCollectionIcon").val();

    updateTree();
}

function showBookmarks(bookmarks, target) {
    $('#bookmarks').empty();

    var bookmarksHtml = "";

    $.each(bookmarks, function (index, bookmark) {

        var item = "<li class='list-group-item list-group-item-action' style='display:block;'>";
        item += "<div class='row'>";

        item += "<div class='col-sm-5'>";

        if (typeof bookmark.icon != 'undefined' || bookmark.icon === "") {
            item += "<img class='bookmarkIcon' src='" + bookmark.icon + "' />";
        } else {
            item += "<span class='bookmarkIcon fa fa-globe'></span>";
        }

        item += "<a target='_blank' href='" + bookmark.url + "'>" + bookmark.text + "</a>";
        item += "</div>";

        item += "<div class='col-sm-6'></div>";
        
        item += "<div class='col-sm-1'>";

        item += "<div class='btn-toolbar' role='toolbar'>";
        item += "<div class='btn-group mr-2' role='group'>"
        item += "<button type='button' style='padding-right: 5px;' class='btn btn-outline-secondary btn-sm' onclick='editBookmark(this)'><span class='fa fa-pencil' aria-hidden='true'></span></button>";
        item += "</div>";

        item += "<div class='btn-group' role='group'>"
        item += "<button type='button' class='btn btn-outline-danger btn-sm' onclick='deleteBookmark(this)'><span class='fa fa-trash-o' aria-hidden='true'></span></button>";
        item += "</div>";

        item += "</div>";

        item += "</div>";

        item += "</div>";
        item += "</li>"

        $(target).append(item);
        bookmarksHtml += item;
    });

    return bookmarksHtml;
}