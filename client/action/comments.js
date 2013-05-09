var comments_default_template = "comments_manage"

Template.comments.view = function() {
    var parse = Session.get("page_template").split("_");
    if (parse.length > 1) {
        return Template[Session.get("page_template")]();
    }

    return Template[comments_default_template]();
}