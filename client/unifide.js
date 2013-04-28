/*
 1. Router set page
 2. Template loads page (check auth)
 */

/*
 URL Routing should convert all url paths from '/' to '_' for templates
 */

var myAppRouter = Backbone.Router.extend({
    routes: {
        "": "static_url",
        "login": "static_url",
        "facebook": "static_url",
        "facebook/page/activity": "static_url",
        "facebook/event/activity": "static_url",
        "twitter": "static_url",
        "twitter/activity": "static_url",
        "foursquare": "static_url",
        "foursquare/venue/activity": "static_url",
        "brand-mention": "static_url",
        "web-platform": "static_url",
        "ios-platform": "static_url",
        "android-platform": "static_url",
        "campaign": "static_url",
        "campaign/promo/new": "static_url",
        "campaign/event/new": "static_url",
        "campaign/new/event": "static_url",
        "manage": "static_url",
        "account/b/:brand": "account_url",
        "account/update": "static_url",
        "account/usage": "static_url",
        "account/auth/twitter/:brand/:str": "social_auth_twitter",
        "account/auth/facebook/:str": "social_auth_facebook",
        "account/auth/foursquare/:str": "social_auth_foursquare",
        "business-info": "static_url",
        "profile": "static_url",
        "items": "items_url",
        "items/*suburl": "items_url"
    },
    static_url: static_url,
    account_url: account_url,
    social_auth_facebook: social_auth_facebook,
    social_auth_twitter: social_auth_twitter,
    social_auth_foursquare: social_auth_foursquare,
    social_auth: social_auth,
    items_url: items_url
});

function static_url() {
    set_page_url();
    Session.set("page_template", (url == "") ? "overview" : parse_url(url));
};

function account_url(brand) {
    Session.set("account_brand", brand);
    static_url();
};

function set_page_url() {
    var url = Backbone.history.fragment;
    Session.set("page", url);
}

function items_url(suburl) {
    set_page_url();
    Session.set(ITEM_SESSION.SUBURL, suburl);
    Session.set("page_template", "items");
    _init_items();
}

function parse_url(url) {
    return url.replace(/\//g, '_');
};

Handlebars.registerHelper('session', function (input) {
    return Session.get(input);
});

function social_auth_facebook(str) {
    var state_idx = str.indexOf("&state=");
    var code = str.substring(6, state_idx).replace(/ /g, '');
    var state = str.substring(state_idx + 7).split("%2C");

    Meteor.call("connect_facebook_auth", code, state[1], function (error, result) {
        Meteor.call("get_platform_url", function (error, result) {
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

function social_auth_foursquare(str) {
    var code = str.substring(str.indexOf("?code=")+6);
    var brand = Session.get("account_brand") != undefined ? Session.get("account_brand") : "default";
    Meteor.call("connect_foursquare_auth", code, brand, function() {
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
        Meteor.subscribe("foursquare", Session.get("selected_brand"));
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