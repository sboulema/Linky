function addCollection() {
    syncTree(function() {
        var selectedCollection = getSelectedCollection();
        var selectedNode = getSelectedNode();

        var newCollection = {
            text: $('#addCollectionName').val(),
            showBookmarkDescription: true,
            showBookmarkIcon: true,
            showBookmarksAsCards: false,
            bookmarkIconSize: 16,
            nodeId: getRandomInt(Number.MAX_SAFE_INTEGER),
            parentId: selectedCollection.nodeId
        };

        if (typeof selectedCollection == 'undefined' || selectedCollection.id === "tree") {
            selectedCollection = newCollection;
            updateTree(selectedCollection);
        } else {
            if (typeof selectedCollection.nodes == 'undefined') {
                selectedCollection.nodes = [];
            }

            tree.addNode(newCollection, selectedNode);

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

        var bookmark = {
            text: $('#addBookmarkName').val(),
            url: $('#addBookmarkUrl').val(),
            description: $('#addBookmarkDescription').val()
        };

        // Get Favicon
        var faviconUrl = "https://favicon.sboulema.nl/favicon?url=" + $('#addBookmarkUrl').val();
        $.get(faviconUrl + "&base64=true", function(data, statusText, xhr) {
            if (xhr.status == 200) {
                bookmark.icon = faviconUrl;
                bookmark.iconData = data;
            }          
        });

        selectedCollection.bookmarks.push(bookmark);

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
        var parent = tree.getDataById(collection.parentId);

        $.each(parent.nodes, function (index, node) {
            if (node.nodeId === collection.nodeId) {
                parent.nodes.splice(index, 1);
                updateTree();
                return false;
            }
        });
    } else {
        var index = getIndex(collection);
        var parent = getParent(collection)[0];

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
        $("#editTags").val(bookmark.tags);
        $("#editBookmarkCollection").val(selectedCollection.text);

        $('#editModal').modal('show');
    // });
}

// Show 'Edit Collection' modal
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
    selectedCollection.bookmarks[bookmarkIndex].tags = $("#editTags").val();

    if ($("#editIcon").val().startsWith("https://favicon.sboulema.nl/favicon")) {
        $.get($("#editIcon").val() + "&base64=true", function(data) {
            selectedCollection.bookmarks[bookmarkIndex].iconData = data;
            updateTree();
        });
    }

    var moveToCollectionId = $("#editMoveToCollection").text();

    if (moveToCollectionId != "") {
        var moveToCollection = tree.getDataById($("#editMoveToCollection").text());

        if (typeof moveToCollection != 'undefined' &&
            typeof moveToCollection.nodeId != 'undefined' && 
            selectedCollection !== moveToCollection) {
            var bookmark = selectedCollection.bookmarks[bookmarkIndex];
            selectedCollection.bookmarks.splice(bookmarkIndex, 1);
            moveToCollection.bookmarks.push(bookmark);
            moveToCollection.tags = [moveToCollection.bookmarks.length];
            selectedCollection.tags = [selectedCollection.bookmarks.length];
        }
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
    var moveToCollection = tree.getDataByText($("#editMoveToCollection").text());
    var parentCollection = getParent(selectedCollection);

    if (typeof moveToCollection != 'undefined' &&
        typeof moveToCollection.nodeId != 'undefined' && 
        moveToCollection !== parentCollection) {
        var copyCollection = $.extend(true, {}, selectedCollection);

        if (typeof moveToCollection.nodes == 'undefined') {
            moveToCollection.nodes = [];
        }

        moveToCollection.nodes.push(copyCollection);

        deleteCollection();
    }

    tree.reload();
    tree.expand(tree.getNodeById(selectedCollection.parentId));
    tree.select(tree.getNodeById(selectedCollection.nodeId));

    updateTree();
}

function showBookmarks(collection, showAsCards) {
    var bookmarksHtml = "";

    if (collection.showBookmarksAsCards) {
        $.each(collection.bookmarks, function (index, bookmark) {
            var item = "<div class='card'>";

            item += "<a target='_blank' href='" + bookmark.url + "' data-toggle='tooltip' data-placement='bottom' title='" + bookmark.text + "'>";
            if (typeof bookmark.icon != 'undefined' && bookmark.icon !== "" && !bookmark.icon.startsWith("fa")) {
                item += "<center><img class='card-img-top' style='width: " + (collection.bookmarkIconSize - 2) + "px;height: " + collection.bookmarkIconSize + "px;' class='bookmarkIcon' " + 
                "src='" + bookmark.icon + "' /></center>";
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
                    "src='" + (typeof bookmark.iconData != 'undefined' ? bookmark.iconData : bookmark.icon) + "' />";
                    item += "<a target='_blank' href='" + bookmark.url + "'>" + bookmark.text + "</a>";
                } else {
                    item += "<span style='font-size: " + collection.bookmarkIconSize + "px;' class='bookmarkIcon fas fa-globe'></span>";
                    item += "<a style='vertical-align: -webkit-baseline-middle; height: 100%; display: inline-block;' target='_blank' href='" + bookmark.url + "'>" + bookmark.text + "</a>";
                }
            }          

            if (collection.showBookmarkDescription && typeof bookmark.description != 'undefined' && bookmark.description != "") {
                item += " - <span>" + bookmark.description + "</span>";
            }
            
            item += showTags(bookmark);

            item += "</div>";
            
            item += createBookmarkButtons(bookmark);

            item += "</div>";
            item += "</li>"

            bookmarksHtml += item;
        });
    }

    return bookmarksHtml;
}

function showTags(bookmark) {
    var tags = $("<span/>", {
        class: "tag"
    });

    if (typeof bookmark.tags === 'undefined') {
        return tags.html();
    }

    bookmark.tags.split(",").forEach(tag => {
        tags.append("<small><i class='fal fa-tag fa-fw'></i>" + tag + "</small>");
    });

    return tags[0].outerHTML;
}

function createBookmarkButtons(bookmark) {
    var buttons = $("<div/>", {
        class: "col-auto btn-toolbar",
        role: "toolbar"
    });

    buttons.append(
        "<div class='btn-group mr-2' role='group' style='height: 31px'>" +
        "<button type='button' class='btn btn-outline-secondary btn-sm' onclick='editBookmark(this)'>" + 
        "<span class='fas fa-pencil fa-fw' aria-hidden='true'></span></button>" +
        "</div>"
    );

    var copyButton = $(
        "<div class='btn-group' role='group' style='height: 31px'>" + 
        "<button type='button' class='btn btn-outline-secondary btn-sm btn-clipboard' data-clipboard-text='" + 
        bookmark.url +  "'>" + "<span class='fas fa-copy fa-fw' aria-hidden='true'></span></button>" +
        "</div>"
    ).appendTo(buttons);

    if (navigator.share) {
        copyButton.addClass("mr-2");

        buttons.append(
            "<div class='btn-group' role='group' style='height: 31px'>" + 
            "<button type='button' class='btn btn-outline-secondary btn-sm' onclick='shareBookmark(this)'>" + 
            "<span class='fas fa-share fa-fw' aria-hidden='true'></span></button>" +
            "</div>" 
        );
    }
    
    return buttons[0].outerHTML;
}

function shareBookmark(node) {
    var bookmark = getSelectedBookmark(node);

    navigator.share({
        title: bookmark.text,
        text: bookmark.description,
        url: bookmark.url,
    })
      .then(() => console.log('Successful share'))
      .catch((error) => console.log('Error sharing', error));  
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
    return tree.getDataById(collection.parentId);
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}