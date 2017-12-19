function getCollections() {
    var collections = [];
    var node = $('#tree').treeview('getNode', 0)
    collections.push(node);
    $.merge(collections, $('#tree').treeview('getSiblings', node));
    return collections;
}

function getSelectedCollection() {
    var nodeId;
    var selectedCollection = $('#tree').treeview('getSelected', nodeId)[0];
    return selectedCollection;
}

function getSelectedBookmarkCard(card) {
    var selectedCollection = getSelectedCollection();
    var bookmarkIndex = getIndexCard(card);
    return selectedCollection.bookmarks[bookmarkIndex];
}

function getSelectedBookmark(node) {
    var selectedCollection = getSelectedCollection();
    var bookmarkIndex = getIndex(node);
    return selectedCollection.bookmarks[bookmarkIndex];
}

function getIndex(node) {
    return $($(node).closest('li')[0]).index();
}

function getIndexCard(node) {
    return $($(node).closest('.card')[0]).index();
}

function syncTree(callback) {
    var selectedCollection = getSelectedCollection();

    loadFromFirebase(function(data){
        parse(data);
        $('#tree').treeview('selectNode', selectedCollection.nodeId)
        callback();
    });
}

function updateTree(element, replaceCollections) {
    if (replaceCollections) {
        saveToFirebase(element);
        parse(element);
    } else {
        var nodes = [];        

        if ($('#tree').treeview('getEnabled').length > 0 && $('#tree').treeview('getEnabled')[0].id !== "tree") {
            nodes.push($('#tree').treeview('getNode', 0));
            $.merge(nodes, $('#tree').treeview('getSiblings', nodes[0]));
        }

        if (typeof element != 'undefined') {
            nodes.push(element);
        }   

        saveToFirebase(nodes);

        parse(nodes);
    }

    updateSelectedCollection();
}

function updateSelectedCollection() {
    var selectedCollection = getSelectedCollection();
    if (typeof selectedCollection != 'undefined') {
        $('#tree').treeview('unselectNode', selectedCollection);
        $('#tree').treeview('selectNode', selectedCollection);
    }
}

Array.prototype.move = function (old_index, new_index) {
    if (new_index >= this.length) {
        var k = new_index - this.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
    return this; // for testing purposes
};

function loadMoveBookmarkTree() {
    loadFromFirebase(function(data) {
    $('#moveBookmark').treeview({
        data: data,
        collapseIcon: "fal fa-folder-open",
        expandIcon: "fal fa-folder",
        emptyIcon: "fal fa-folder"
    });
    $('#moveBookmark').treeview('collapseAll', { silent: true });
    $('#moveBookmark').on('nodeSelected', function(event, data) {
        $("#editMoveToCollection").text(data.nodeId);
        $("#editBookmarkCollection").val(data.text);
    });
  });
}

function parse(input) {
    // var db = firebase.firestore();

    // db.collection("bookmarks").add({
    //     bookmarks: input
    // })
    // .then(function(docRef) {
    //     console.log("Document written with ID: ", docRef.id);
    // })
    // .catch(function(error) {
    //     console.error("Error adding document: ", error);
    // });

    $('#tree').treeview({
        data: input,
        collapseIcon: "fal fa-folder-open",
        expandIcon: "fal fa-folder",
        backColor: "rgb(246, 246, 246)",
        emptyIcon: "fal fa-folder",
        showTags: localStorage.getItem("showBookmarkCount") == "true"
    });

    $('#tree').on('nodeSelected', function(event, data) {
        $("#accordion").empty();
        $('#bookmarks').empty();
        $('#bookmarksCards').empty();

        if (data.showBookmarksAsCards) {
            if (typeof data.bookmarks != 'undefined' && data.bookmarks.length > 0) {          
                $("#bookmarksCards").append(showBookmarks(data, true));
                $('[data-toggle="tooltip"]').tooltip();
            }
        } else {
            if (typeof data.bookmarks != 'undefined' && data.bookmarks.length > 0) {          
                $("#bookmarks").append(showBookmarks(data));
            }
        }

        if (typeof data.nodes != 'undefined' && data.nodes.length > 0) {
            $.each(data.nodes, function (index, node) {
                var card = "<div class='card'>";

                card += "<div class='card-header' role='tab' id='heading" + index + "'>";
                card += "<h5 class='mb-0'>";
                card += "<a data-toggle='collapse' data-parent='#accordion' href='#collapse" + index + "' aria-expanded='true' aria-controls='collapse" + index + "'>";
                card += node.text;
                card += "</a>";
                card += "</h5>"
                card += "</div>";

                card += "<div id='collapse" + index + "' class='collapse' role='tabpanel' aria-labelledby='heading" + index + "'>";

                card += "<ul id='nodeBookmarks" + index + "' class='list-group' style='display:block;'>"
                card += showBookmarks(node, "#nodeBookmarks" + index);
                card += "</ul>";

                card += "</div></div><br/>";

                $("#accordion").append(card);
            });
        }
        
        $("#search").attr("placeholder", data.text);

        if (typeof data.icon != 'undefined') {
            $("#collectionIcon").html("<i class='" + data.icon + "'></i>");
        } else {
            $("#collectionIcon").html("<i class='fas fa-ellipsis-h'></i>");
        }

        // Enable Copy Url buttons
        var clipboard = new Clipboard('.btn-clipboard');
        clipboard.on('success', function(e) {          
            $.notify(
                {
                    message: "Bookmark URL copied to clipboard"
                }
                ,{
                    type: 'success',
                    delay: 1000
                }
            );
        });

        // Make the bookmarks sortable
        var el = document.getElementById('bookmarks');
        if (el.children.length > 0) {
            var sortable = Sortable.create(el, {
                onSort: function (evt) {
                    var collection = getSelectedCollection();
                    collection.bookmarks.move(evt.oldIndex, evt.newIndex);
                    updateTree();
                }
            });
        }

        // Make the bookmark cards sortable
        var el = document.getElementById('bookmarksCards');
        if (el.children.length > 0) {
            var sortable = Sortable.create(el, {
                onSort: function (evt) {
                    var collection = getSelectedCollection();
                    collection.bookmarks.move(evt.oldIndex, evt.newIndex);
                    updateTree();
                }
            });
        }

        // Make the collections sortable
        var el = document.getElementById('tree').children[0];
        if (el.children.length > 0) {
            var sortable = Sortable.create(el, {
                onEnd: function (evt) {
                    var collection = getSelectedCollection();
                    var parent = $('#tree').treeview('getParent', collection);

                    if (typeof parent == 'undefined') {
                        var collections = getCollections();

                        var temp = collections[evt.oldIndex];
                        collections[evt.oldIndex] = collections[evt.newIndex];
                        collections[evt.newIndex] = temp;

                        updateTree(collections, true);
                    } else {
                        parent.nodes.move(evt.oldIndex - 1, evt.newIndex - 1);
                        updateTree();
                    }
                }
            });
        }
    });
}