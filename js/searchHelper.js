function search() {
    var needle = $("#search").val();
    var hayStack = tree.getAll();
    
    var selectedCollection = getSelectedCollection();
    if (typeof selectedCollection != 'undefined') {
        hayStack = [];
        hayStack.push(selectedCollection);
    }

    var bookmarks = find(hayStack, needle);

    var searchCollection = {
        bookmarks: bookmarks,
        showBookmarkIcon: true,
        showBookmarkDescription: true,
        bookmarkIconSize: 16
    };

    $("#accordion").empty();
    $('#bookmarks').empty();
    $('#bookmarksCards').empty();

    $("#bookmarks").append(showBookmarks(searchCollection));   
}

// Check for search keyword in text, description, tags
function matchBookmark(bookmark, needle) {
    var needle = needle.toLowerCase();

    if (bookmark.text.toLowerCase().includes(needle)) {
        return true;
    }

    if (typeof bookmark.description != 'undefined' && 
        bookmark.description.toLowerCase().includes(needle)) {
        return true;
    }

    if (typeof bookmark.tags != 'undefined' && 
        bookmark.tags.toLowerCase().includes(needle)) {
        return true;
    }

    return false;       
}

function find(arr, needle) {
    var matches = [];
    if (!Array.isArray(arr)) return matches;

    arr.forEach(function(i) {
        if (typeof i.bookmarks != 'undefined') {
            i.bookmarks.forEach(function(b) {
                if (matchBookmark(b, needle)) {
                    matches.push(b);
                }
            });
        }

        let childResults = find(i.nodes, needle);
        if (childResults.length) {
            matches = matches.concat(childResults);
        }
    });

    return matches;
}