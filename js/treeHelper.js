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
        $('#bookmarks').empty();
        $.each(data.bookmarks, function (index, bookmark) {

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

            $('#bookmarks').append(item);
        });


        $("#collectionName").text(data.text)
        $("#collectionIcon").addClass(data.icon)

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