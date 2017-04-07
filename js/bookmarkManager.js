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