var facebook_default_template = "facebook_list"

Template.facebook.view = function() {
    var parse = Session.get("page_template").split("_");
    if (parse.length > 1) {
        return Template[Session.get("page_template")]();
    }

    return Template[facebook_default_template]();
}