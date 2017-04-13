function addCollection() {
    var nodeId;
    var selectedCollection = $('#tree').treeview('getSelected', nodeId)[0];

    var newCollection = {
        text: $('#addCollectionName').val(),
        showBookmarkDescription: true,
        showBookmarkIcon: true,
        showBookmarksAsCards: false,
        bookmarkIconSize: 16
    };

    if (typeof selectedCollection == 'undefined' || selectedCollection.id === "tree") {
        selectedCollection = newCollection;
        updateTree(selectedCollection);
    } else {
        if (typeof selectedCollection.nodes == 'undefined') {
            selectedCollection.nodes = [];
        }

        selectedCollection.nodes.push(newCollection);
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
        description: $('#addBookmarkDescription').val(),
        icon: "http://logo.clearbit.com/" + (new URL($('#addBookmarkUrl').val())).hostname
    });

    $('#addBookmarkName').val("");
    $('#addBookmarkUrl').val("");
    $('#addBookmarkDescription').val("");

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

    if (typeof collection.parentId != 'undefined') {
        var parent = $('#tree').treeview('getNode', collection.parentId);

        $.each(parent.nodes, function (index, node) {
            if (node.nodeId === collection.nodeId) {
                parent.nodes.splice(index, 1);
                updateTree();
                return false;
            }
        });
    } else {
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
}

function editBookmark(node, isCard) {     
    var bookmark;
    var bookmarkIndex;

    if (isCard) {
        bookmark = getSelectedBookmarkCard(node);
        bookmarkIndex = getIndexCard(node);
    } else {
        bookmark = getSelectedBookmark(node);
        bookmarkIndex = getIndex(node);
    }   

    $("#editName").val(bookmark.text);
    $("#editUrl").val(bookmark.url);
    $("#editIcon").val(bookmark.icon);
    $("#editIconAddon").attr("src", bookmark.icon);
    $("#editIndex").text(bookmarkIndex);
    $("#editDescription").val(bookmark.description);
    $('#editModal').modal('show');
}

function editCollection() {
    var selectedCollection = getSelectedCollection();

    $("#editCollectionName").val(selectedCollection.text);
    $("#editCollectionIcon").val(selectedCollection.icon);
    $("#showBookmarkIconCheckbox").prop('checked', selectedCollection.showBookmarkIcon);
    $("#showBookmarkDescriptionCheckbox").prop('checked', selectedCollection.showBookmarkDescription);
    $("#bookmarkIconSizeSlider").val(selectedCollection.bookmarkIconSize);
    $("#showBookmarksAsCardsCheckbox").prop('checked', selectedCollection.showBookmarksAsCards);   
    $('#editCollectionModal').modal('show');
}

function saveBookmark() {
    var selectedCollection = getSelectedCollection();
    var bookmarkIndex = parseInt($("#editIndex").text());

    selectedCollection.bookmarks[bookmarkIndex].text = $("#editName").val();
    selectedCollection.bookmarks[bookmarkIndex].url = $("#editUrl").val();
    selectedCollection.bookmarks[bookmarkIndex].icon = $("#editIcon").val();
    selectedCollection.bookmarks[bookmarkIndex].description = $("#editDescription").val();

    updateTree();
}

function saveCollection() {
    var selectedCollection = getSelectedCollection();
    selectedCollection.text = $("#editCollectionName").val();
    selectedCollection.icon = $("#editCollectionIcon").val();
    selectedCollection.showBookmarkIcon = $("#showBookmarkIconCheckbox").is(':checked');
    selectedCollection.showBookmarkDescription = $("#showBookmarkDescriptionCheckbox").is(':checked');
    selectedCollection.bookmarkIconSize = $("#bookmarkIconSizeSlider").val();
    selectedCollection.showBookmarksAsCards = $("#showBookmarksAsCardsCheckbox").is(':checked');  

    updateTree();
}

function getAllBookmarks() {
    var bookmarks = [];
    return search(getCollections(), "bookmarks", bookmarks);
}

search = function(hay, needle, accumulator) {
  var accumulator = accumulator || [];
  if (typeof hay == 'object') {
    for (var i in hay) {
        if (i === needle) {
            $.merge(accumulator, hay[i]);
        }
        search(hay[i], needle, accumulator) == true ? accumulator.push(hay) : 1;
    }
  }
  return new RegExp(needle).test(hay) || accumulator;
}

function showAllBookmarks() {
    $("#collectionName").attr("placeholder", "All bookmarks");

    $("#collectionIcon").removeClass();
    $("#collectionIcon").addClass("fa fa-heart");

    $("#accordion").empty();
    $('#bookmarks').empty();

    var collection = {
        bookmarks: getAllBookmarks(),
        showBookmarkIcon: true,
        showBookmarkDescription: true,
        bookmarkIconSize: 16
    };

    $("#bookmarks").html(showBookmarks(collection));
}

function showBookmarks(collection, showAsCards) {
    var bookmarksHtml = "";

    if (collection.showBookmarksAsCards) {
        $.each(collection.bookmarks, function (index, bookmark) {
            var item = "<div class='card'>";

            if (typeof bookmark.icon != 'undefined' && bookmark.icon !== "" && !bookmark.icon.startsWith("fa")) {
                item += "<center><img class='card-img-top' style='width: " + collection.bookmarkIconSize + "px;height: " + collection.bookmarkIconSize + "px;' class='bookmarkIcon' " + 
                "src='" + (bookmark.icon.startsWith("http://logo.clearbit.com/") ? (bookmark.icon + "?size=" + collection.bookmarkIconSize) : bookmark.icon) + "' /></center>";
            } else {
                item += "<span class='card-img-top' style='width: " + collection.bookmarkIconSize + "px;height: " + collection.bookmarkIconSize + "px;' class='bookmarkIcon fa fa-globe'></span>";
            }

            item += "<div class='card-block'>";
        	item += "<h6 class='card-title'><a target='_blank' href='" + bookmark.url + "'>" + bookmark.text + "</a></h6>";

            if (collection.showBookmarkDescription && typeof bookmark.description != 'undefined') {
                item += "<p class='card-text'>" + bookmark.description + "</p>";
            }
          
            item += "</div>";

            item += "<div class='card-footer'>";
                item += "<div class='btn-toolbar' role='toolbar'>";
                    item += "<div class='btn-group mr-2' role='group'>"
                        item += "<button type='button' style='padding-right: 5px;' class='btn btn-outline-secondary btn-sm' onclick='editBookmark(this, true)'><span class='fa fa-pencil' aria-hidden='true'></span></button>";
                    item += "</div>";

            item += "<div class='btn-group' role='group'>"
            item += "<button type='button' class='btn btn-outline-danger btn-sm' onclick='deleteBookmark(this)'><span class='fa fa-trash-o' aria-hidden='true'></span></button>";
            item += "</div>";
            item += "</div>";
            item += "</div>";

            item += "</div>";

            bookmarksHtml += item;
        });
    } else {
        $.each(collection.bookmarks, function (index, bookmark) {

            var item = "<li class='list-group-item list-group-item-action' style='display:block;'>";
            item += "<div class='row'>";

            item += "<div class='col-sm-11'>";

            if (collection.showBookmarkIcon) {
                if (typeof bookmark.icon != 'undefined' && bookmark.icon !== "" && !bookmark.icon.startsWith("fa")) {
                    item += "<img style='width: " + collection.bookmarkIconSize + "px;height: " + collection.bookmarkIconSize + "px;' class='bookmarkIcon' " + 
                    "src='" + (bookmark.icon.startsWith("http://logo.clearbit.com/") ? (bookmark.icon + "?size=" + collection.bookmarkIconSize) : bookmark.icon) + "' />";
                    item += "<a target='_blank' href='" + bookmark.url + "'>" + bookmark.text + "</a>";
                } else {
                    item += "<span style='font-size: " + collection.bookmarkIconSize + "px;' class='bookmarkIcon fa fa-globe'></span>";
                    item += "<a style='vertical-align: -webkit-baseline-middle; height: 100%; display: inline-block;' target='_blank' href='" + bookmark.url + "'>" + bookmark.text + "</a>";
                }
            }          

            if (collection.showBookmarkDescription && typeof bookmark.description != 'undefined' && bookmark.description != "") {
                item += " - <span>" + bookmark.description + "</span>";
            }
                
            item += "</div>";
            
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

            bookmarksHtml += item;
        });
    }

    return bookmarksHtml;
}