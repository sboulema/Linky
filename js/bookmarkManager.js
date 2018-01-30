function addCollection() {
    syncTree(function() {
        var newCollection = {
            text: $('#addCollectionName').val(),
            showBookmarkDescription: true,
            showBookmarkIcon: true,
            showBookmarksAsCards: false,
            bookmarkIconSize: 16
        };

        var selectedCollection = getSelectedCollection();

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
    });
}

function addBookmark() {
    syncTree(function(){
        var selectedCollection = getSelectedCollection();

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
    });
}

function deleteBookmark() {
    var selectedCollection = getSelectedCollection();
    var bookmarkIndex = parseInt($("#editIndex").text());

    selectedCollection.bookmarks.splice(bookmarkIndex, 1);

    updateTree();
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

    // syncTree(function() {
        if (isCard) {
            bookmark = getSelectedBookmarkCard(node);
            bookmarkIndex = getIndexCard(node);
        } else {
            bookmark = getSelectedBookmark(node);
            bookmarkIndex = getIndex(node);
        }   
        var selectedCollection = getSelectedCollection();

        $("#editName").val(bookmark.text);
        $("#editUrl").val(bookmark.url);
        $("#editIcon").val(bookmark.icon);
        $("#editIconAddon").attr("src", bookmark.icon);
        $("#editIndex").text(bookmarkIndex);
        $("#editDescription").val(bookmark.description);
        $("#editBookmarkCollection").val(selectedCollection.text);

        $('#editModal').modal('show');
    // });
}

function editCollection() {
    var selectedCollection = getSelectedCollection();

    syncTree(function() {
        $("#editCollectionName").val(selectedCollection.text);
        $("#editCollectionIcon").val(selectedCollection.icon);
        $("#editCollectionBackground").val(selectedCollection.background);
        $("#showBookmarkIconCheckbox").prop('checked', selectedCollection.showBookmarkIcon);
        $("#showBookmarkDescriptionCheckbox").prop('checked', selectedCollection.showBookmarkDescription);
        $("#bookmarkIconSizeSlider").val(selectedCollection.bookmarkIconSize);
        $("#showBookmarksAsCardsCheckbox").prop('checked', selectedCollection.showBookmarksAsCards); 
        $("#editCollectionIconAddon").html("<i class='" + selectedCollection.icon + "'></i>");  

        $("#editIndex").text(getIndex(selectedCollection));
        $("#editCollectionParent").val(getParent(selectedCollection).text);

        $('#editCollectionModal').modal('show');    
    });
}

function saveBookmark() {
    var selectedCollection = getSelectedCollection();
    var bookmarkIndex = parseInt($("#editIndex").text());

    selectedCollection.bookmarks[bookmarkIndex].text = $("#editName").val();
    selectedCollection.bookmarks[bookmarkIndex].url = $("#editUrl").val();
    selectedCollection.bookmarks[bookmarkIndex].icon = $("#editIcon").val();
    selectedCollection.bookmarks[bookmarkIndex].description = $("#editDescription").val();

    var moveToCollection = $('#tree').treeview('getNode', $("#editMoveToCollection").text());

    if (typeof moveToCollection.nodeId != 'undefined' && selectedCollection !== moveToCollection) {
        var bookmark = selectedCollection.bookmarks[bookmarkIndex];
        selectedCollection.bookmarks.splice(bookmarkIndex, 1);
        moveToCollection.bookmarks.push(bookmark);
        moveToCollection.tags = [moveToCollection.bookmarks.length];
        selectedCollection.tags = [selectedCollection.bookmarks.length];
    }

    updateTree();
}

function saveCollection() {
    var selectedCollection = getSelectedCollection();

    selectedCollection.text = $("#editCollectionName").val();
    selectedCollection.icon = $("#editCollectionIcon").val();
    selectedCollection.background = $("#editCollectionBackground").val();
    selectedCollection.showBookmarkIcon = $("#showBookmarkIconCheckbox").is(':checked');
    selectedCollection.showBookmarkDescription = $("#showBookmarkDescriptionCheckbox").is(':checked');
    selectedCollection.bookmarkIconSize = $("#bookmarkIconSizeSlider").val();
    selectedCollection.showBookmarksAsCards = $("#showBookmarksAsCardsCheckbox").is(':checked');  

    // Check if we need to move the collection to a new parent
    var moveToCollection = $('#tree').treeview('getNode', $("#editMoveToCollection").text());
    var parentCollection = $('#tree').treeview('getParent', selectedCollection)[0];

    if (typeof moveToCollection.nodeId != 'undefined' && moveToCollection !== parentCollection) {
        var copyCollection = $.extend(true, {}, selectedCollection);

        if (typeof moveToCollection.nodes == 'undefined') {
            moveToCollection.nodes = [];
        }

        moveToCollection.nodes.push(copyCollection);

        deleteCollection();
    }

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

    $("#collectionIcon").html("<i class='fas fa-heart'></i>");

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

            item += "<a target='_blank' href='" + bookmark.url + "' data-toggle='tooltip' data-placement='bottom' title='" + bookmark.text + "'>";
            if (typeof bookmark.icon != 'undefined' && bookmark.icon !== "" && !bookmark.icon.startsWith("fa")) {
                item += "<center><img class='card-img-top' style='width: " + (collection.bookmarkIconSize - 2) + "px;height: " + collection.bookmarkIconSize + "px;' class='bookmarkIcon' " + 
                "src='" + (bookmark.icon.startsWith("http://logo.clearbit.com/") ? (bookmark.icon + "?size=" + collection.bookmarkIconSize) : bookmark.icon) + "' /></center>";
            } else {
                item += "<span class='card-img-top' style='width: " + collection.bookmarkIconSize + "px;height: " + collection.bookmarkIconSize + "px;' class='bookmarkIcon fas fa-globe'></span>";
            }
            item += "</a>";

            item += "<button type='button' class='btn btn-primary btn-sm cardEditButton' onclick='editBookmark(this, true)'>" + 
                "<span class='fas fa-pencil' aria-hidden='true'></span></button>";

            item += "</div>";

            bookmarksHtml += item;
        });
        
    } else {
        $.each(collection.bookmarks, function (index, bookmark) {

            var item = "<li class='list-group-item list-group-item-action' style='display:block;'>";
            item += "<div class='row'>";

            item += "<div class='col'>";

            if (collection.showBookmarkIcon) {
                if (typeof bookmark.icon != 'undefined' && bookmark.icon !== "" && !bookmark.icon.startsWith("fa")) {
                    item += "<img style='width: " + collection.bookmarkIconSize + "px;height: " + collection.bookmarkIconSize + "px;' class='bookmarkIcon' " + 
                    "src='" + (bookmark.icon.startsWith("http://logo.clearbit.com/") ? (bookmark.icon + "?size=" + collection.bookmarkIconSize) : bookmark.icon) + "' />";
                    item += "<a target='_blank' href='" + bookmark.url + "'>" + bookmark.text + "</a>";
                } else {
                    item += "<span style='font-size: " + collection.bookmarkIconSize + "px;' class='bookmarkIcon fas fa-globe'></span>";
                    item += "<a style='vertical-align: -webkit-baseline-middle; height: 100%; display: inline-block;' target='_blank' href='" + bookmark.url + "'>" + bookmark.text + "</a>";
                }
            }          

            if (collection.showBookmarkDescription && typeof bookmark.description != 'undefined' && bookmark.description != "") {
                item += " - <span>" + bookmark.description + "</span>";
            }
                
            item += "</div>";
            
            item += "<div class='col-md-auto' style='margin-right: 15px;'>";
            item += "<button type='button' style='padding-right: 5px;' class='btn btn-outline-secondary btn-sm' onclick='editBookmark(this)'>" + 
                "<span class='fas fa-pencil' aria-hidden='true'></span></button>";
            item += "<button type='button' style='padding-right: 5px;' class='btn btn-outline-secondary btn-sm btn-clipboard' data-clipboard-text='" + 
                bookmark.url +  "'>" + "<span class='fas fa-copy' aria-hidden='true'></span></button>";
            item += "</div>";

            item += "</div>";
            item += "</li>"

            bookmarksHtml += item;
        });
    }

    return bookmarksHtml;
}

function getCollectionBackground(collection) {
    if (typeof collection !== 'undefined' &&
        typeof collection.background !== 'undefined' && 
        collection.background !== "inherit") {
        return collection.background;
    }

    if (collection.id === "tree") {
        return "";
    }

    return getCollectionBackground(getParent(collection));
}

function getParent(collection) {
    var parent = $('#tree').treeview('getNode', collection.parentId);

    if (parent.length === 1) {
        return parent[0];
    }

    return parent;
}