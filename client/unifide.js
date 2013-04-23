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
        "account/b/:brand": "account_url",
        "account/update": "static_url",
        "account/usage": "static_url",
        "account/auth/twitter/:brand/:str": "social_auth_twitter",
        "account/auth/:str": "social_auth",
        "profile": "static_url"
    },
    static_url: static_url,
    account_url: account_url,
    social_auth: social_auth,
    social_auth_twitter: social_auth_twitter
});

function static_url() {
    var url = Backbone.history.fragment;
    Session.set("page", url);
    Session.set("page_template", (url == "") ? "overview" : parse_url(url));
};

function account_url(brand) {
    Session.set("account_brand", brand);
    static_url();
};

function parse_url(url) {
    return url.replace(/\//g, '_');
};

function social_auth(str) {
    var state_idx = str.indexOf("&state=");
    var code = str.substring(6, state_idx).replace(/ /g, '');
    var state = str.substring(state_idx+7).split("%2C");

    Meteor.call("connect_facebook_auth", code, state[1], function(error, result) {
        Meteor.call("get_platform_url", function(error, result) {
            window.location.href = result + "account/b/" + state[1];
        });
    });
};

function social_auth_twitter(brand, str) {
    var oauth_verifier = str.substring(str.indexOf("oauth_verifier=")+15);
    Meteor.call("connect_twitter_auth", oauth_verifier, brand, function() {
        Meteor.call("get_platform_url", function(error, result) {
            window.location.href = result + "account/b/" + brand;
        });
    });
};

Meteor.startup(function() {
    Deps.autorun(function() {
        Meteor.subscribe("cp_menu");
        Meteor.subscribe("accounts");
        Meteor.subscribe("mapping");
        Meteor.subscribe("facebook", Session.get("selected_brand"));
        Meteor.subscribe("twitter", Session.get("selected_brand"));
        Meteor.subscribe("brand_mention");
        Meteor.subscribe("keyword");
    });
});

/*
    Initialize Backbone routing
 */

Router = new myAppRouter;

// use HTML5 pushState when available
Backbone.history.start({pushState: true});