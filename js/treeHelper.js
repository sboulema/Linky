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

function getSelectedBookmark(node) {
    var selectedCollection = getSelectedCollection();
    var bookmarkIndex = getIndex(node);
    return selectedCollection.bookmarks[bookmarkIndex];
}

function getIndex(node) {
    return $($(node).closest('li')[0]).index();
}

function updateTree(element, replaceCollections) {
    if (replaceCollections) {
        saveToMyJson(element);
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

        saveToMyJson(nodes);

        parse(nodes);
    }
}

function parse(input) {
    $('#tree').treeview({
        data: input,
        collapseIcon: "fa fa-folder-open-o",
        expandIcon: "fa fa-folder-o",
        backColor: "rgb(246, 246, 246)",
        emptyIcon: "fa fa-folder-o"
    });

    $('#tree').on('nodeSelected', function(event, data) {
        if (typeof data.bookmarks != 'undefined' && data.bookmarks.length > 0) {
            $("#accordion").empty();
            showBookmarks(data.bookmarks, "#bookmarks");
        } else {
            $("#accordion").empty();
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
                card += showBookmarks(node.bookmarks, "#nodeBookmarks" + index);
                card += "</ul>";

                card += "</div></div><br/>";

                $("#accordion").append(card);
            });
        }
        
        $("#collectionName").text(data.text);

        $("#collectionIcon").removeClass();
        $("#collectionIcon").addClass(data.icon);

        // Make the bookmarks sortable
        var el = document.getElementById('bookmarks');
        if (el.children.length > 0) {
            var sortable = Sortable.create(el, {
                onSort: function (evt) {
                    var collection = getSelectedCollection();

                    var temp = collection.bookmarks[evt.oldIndex];
                    collection.bookmarks[evt.oldIndex] = collection.bookmarks[evt.newIndex];
                    collection.bookmarks[evt.newIndex] = temp;

                    updateTree();
                }
            });
        }

        // Make the collections sortable
        var el = document.getElementById('tree').children[0];
        if (el.children.length > 0) {
            var sortable = Sortable.create(el, {
                onSort: function (evt) {
                    var collection = getSelectedCollection();
                    var parent = $('#tree').treeview('getParent', collection)[0];

                    if (parent.id === "tree") {
                        var collections = getCollections();

                        var temp = collections[evt.oldIndex];
                        collections[evt.oldIndex] = collections[evt.newIndex];
                        collections[evt.newIndex] = temp;

                        updateTree(collections, true);
                    } else {
                        var temp = parent.nodes[evt.oldIndex];
                        parent.nodes[evt.oldIndex] = parent.nodes[evt.newIndex];
                        parent.nodes[evt.newIndex] = temp;

                        updateTree();
                    }
                }
            });
        }
    });
}