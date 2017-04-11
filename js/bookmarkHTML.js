function collectionToBookmarkHtml(collection) {
    var html = addHeader();

    html += "<DL><p>";
    html += transformCollection(collection);
    html += "</DL><p>";

    return html;
}

function collectionsToBookmarkHtml(collections) {
    var html = addHeader();

    html += "<DL><p>";

    $.each(collections, function (index, collection) {
        html += transformCollection(collection);
    });

    html += "</DL><p>";

    return html;
}

function addHeader() {
    var html = "<!DOCTYPE NETSCAPE-Bookmark-file-1>";
    html += "<META HTTP-EQUIV=\"Content-Type\" CONTENT=\"text/html; charset=UTF-8\">";
    html += "<TITLE>Linky Bookmarks</TITLE>";
    html += "<H1>Linky Bookmarks</H1>"
    return html;
}

function transformCollection(collection) {
    var html = "<DT><H3>" + collection.text + "</H3>";
    html += "<DL><p>";

    $.each(collection.bookmarks, function (index, bookmark) {
        html += "<DT><A HREF=\""+ bookmark.url + "\" ICON=\"default\">" + bookmark.text + "</A>";
    });

    $.each(collection.nodes, function (index, node) {
        transformCollection(html, node);
    });

    html += "</DL><p>";
    return html;
}