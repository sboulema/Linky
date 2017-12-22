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
        html += transformCollection(node);
    });

    html += "</DL><p>";
    return html;
}

function importHTML(html) {
    var collections = [];

    var root = $.parseHTML(html).find(function(item){return item.localName === "dl"});
    
    $.each(Array.from(root.children).filter(item => item.localName === "dt"), function (index, collection) {
        importHTMLCollection(collections, collection);
    });

    return collections;
}

function importHTMLCollection(collections, collection) {
    if (typeof collection === 'undefined') {
        return;
    }

    var children = Array.from(collection.children);

    var text = "";
    var h3 = children.find(function(item){return item.localName === "h3"});
    if (typeof h3 !== 'undefined') {
        text = h3.textContent;
    }

    var root = children.find(function(item){return item.localName === "dl"});

    var nodes = [];
    var bookmarks = [];

    $.each(Array.from(root.children).filter(item => item.localName === "dt"), function(index, subItem) {
        var h3 = Array.from(subItem.children).find(function(item){return item.localName === "h3"});
        if (typeof h3 != 'undefined') {
            importHTMLCollection(nodes, subItem);
        } else {
            var href = Array.from(subItem.children).filter(link => link.localName == "a")[0];
            if (typeof href !== 'undefined') {
                bookmarks.push({text: href.textContent, url: href.attributes["href"].value});
            } 
        }     
    });  

    collections.push({ text: text, nodes: nodes, bookmarks: bookmarks });
}