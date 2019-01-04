var tree;

function getCollections() {
    return tree.getAll();
}

// Get the data from the selected node
function getSelectedCollection() {
    var id = tree.getSelections()[0];
    return tree.getDataById(id);
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
        tree.select(tree.getNodeById(selectedCollection.nodeId));
        callback();
    });
}

function updateTree(element, replaceCollections) {
    if (replaceCollections) {
        saveToFirebase(element);
        parse(element);
    } else {
        var nodes = [];        

        if (tree.getAll().length > 0 && tree.getAll()[0].id !== "tree") {
            nodes = tree.getAll();
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
        var node = tree.getNodeById(selectedCollection.id);
        tree.unselect(node);
        tree.select(node);
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
        var moveTree = $('#moveBookmark').tree({
            uiLibrary: 'bootstrap4',
            dataSource: data,
            primaryKey: 'nodeId',
            childrenField: 'nodes',
            imageCssClassField: 'icon',
            iconsLibrary: 'fontawesome',
            icons: {
                expand: '<i class="fal fa-folder"></i>',
                collapse: '<i class="fal fa-folder-open"></i>'
            }
        });
        moveTree.collapseAll();
        moveTree.on('select', function (e, node, id) {
            var data = tree.getDataById(id);
            $("#editMoveToCollection").text(data.nodeId);
            $("#editBookmarkCollection").val(data.text);
        });
    });
}

function parse(input) {
    tree = $('#tree').tree({
        uiLibrary: 'bootstrap4',
        dataSource: input,
        primaryKey: 'nodeId',
        childrenField: 'nodes',
        border: true,
        imageCssClassField: 'icon',
        iconsLibrary: 'fontawesome',
        icons: {
            expand: '<i class="fal fa-folder"></i>',
            collapse: '<i class="fal fa-folder-open"></i>'
        }
    });

    var clipboard;

    tree.on('select', function (e, node, id) {
        var data = tree.getDataById(id);

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
                $("#bookmarkColumn").css("background-image", "linear-gradient(rgba(255,255,255,0.5),rgba(255,255,255,0.5)), url(" + getCollectionBackground(data) + ")")
            }
        }

        if (typeof data.nodes != 'undefined' && data.nodes.length > 0) {
            $.each(data.nodes, function (index, node) {
                var card = "<div class='card'>";

                card += "<div class='card-header' role='tab' id='heading" + index + "'>";
                card += "<h5 class='mb-0'>";
                card += "<a data-toggle='collapse' class=' text-danger' data-parent='#accordion' href='#collapse" + index + "' aria-expanded='true' aria-controls='collapse" + index + "'>";
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

        // Set the collection icon in the search bar
        if (typeof data.icon != 'undefined' && data.icon != "") {
            $("#collectionIcon").html("<i class='" + data.icon + "'></i>");
        } else {
            $("#collectionIcon").html("<i class='fas fa-ellipsis-h'></i>");
        }

        // Enable Copy Url buttons
        if (clipboard) {
            clipboard.destroy();
        }

        clipboard = new Clipboard('.btn-clipboard');
        clipboard.on('success', function(e) {
            $('#urlCopiedToast').toast('show');
        });

        if(!is_touch_device()) {
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
        }
    });
}

function is_touch_device() {
    var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
    var mq = function(query) {
      return window.matchMedia(query).matches;
    }
  
    if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
      return true;
    }
  
    // include the 'heartz' as a way to have a non matching MQ to help terminate the join
    // https://git.io/vznFH
    var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
    return mq(query);
}