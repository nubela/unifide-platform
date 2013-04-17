/*
    1. Router set page
    2. Template loads page (check auth)
*/

/*
    URL Routing should convert all url paths from '/' to '_' for templates
 */

var myAppRouter = Backbone.Router.extend({
    routes: {
        "" : "static_url",
        "login": "static_url",
        "facebook": "static_url",
        "twitter": "static_url",
        "foursquare": "static_url",
        "brand-mention": "static_url",
        "web-platform": "static_url",
        "ios-platform": "static_url",
        "android-platform": "static_url",
        "campaign": "static_url",
        "campaign/new/promo": "static_url",
        "campaign/new/event": "static_url",
        "manage": "static_url",
        "account/:str": "account_url",
        "profile": "static_url"
    },
    static_url: static_url,
    account_url: account_url
});

function static_url() {
    var url = Backbone.history.fragment;
    Session.set("page", url);
    Session.set("page_template", (url == "") ? "overview" : parse_url(url));
};

function account_url(str) {
    Session.set("account_brand", str);
    static_url();
};

function parse_url(url) {
    return url.replace(/\//g, '_');
};

Meteor.startup(function() {
    Deps.autorun(function() {
        Meteor.subscribe("cp_menu");
        Meteor.subscribe("mapping");
        Meteor.subscribe("facebook", {posts_offset: 0, comments_offset: 0});
        Meteor.subscribe("facebook_attr");
        Meteor.subscribe("twitter");
    });
});

/*
    Initialize Backbone routing
 */

Router = new myAppRouter;

// use HTML5 pushState when available
Backbone.history.start({pushState: true});