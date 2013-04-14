/* 1. Router set page
*  2. Template loads page (check auth)
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
        "account": "static_url"
    },
    static_url: static_url
});

function static_url() {
    var url = Backbone.history.fragment;
    Session.set("page", url);
    Session.set("page_template", (url == "") ? "overview" : parse_url(url));
};

function parse_url(url) {
    return url.replace(/\//g, '_');
};

function isAuth() {
    return (Meteor.user() != null) ? true : false;
};

Template.page_controller.view = function() {

    if (Meteor.loggingIn()) { return; }
    if (Session.get("page") == undefined) { return; }

    if (isAuth()) {
        return Template['page_index']();
    } else {
        Router.navigate('login', true);
        return Template['page_login']();
    }
}

Template.page_index.rendered = function() {
    $('body').css('background', '#eaeaea url("/media/img/pattern_noise.png") 0 0 repeat');
}

Template.page_content.view = function() {
    return Template[Session.get("page_template").split("_")[0]]();
}

Meteor.startup(function() {
    Deps.autorun(function() {
        Meteor.subscribe("cp_menu");
        Meteor.subscribe("facebook", {posts_offset: 0, comments_offset: 0});
        Meteor.subscribe("facebook_attr");
        Meteor.subscribe("twitter");
    });
});

Template.menu.menu_list = function() {
    return CPMenu.find({}, {sort: {order: 1}});
};

Template.page_controller.events = {
    'click .appnav': router_navigation
}

Template.header.events = {
    'click #logout': function() {
        Meteor.logout();
    }
}

Template.header.username = function() {
    return getUsername().toUpperCase();
}

Template.menu.username = function() {
    return getUsername();
}

function getUsername() {
    return Meteor.user() != null ? Meteor.user().username : "Loading...";
}

function router_navigation(event) {
    // prevent default browser link click behavior
    event.preventDefault();
    // get the path from the link
    var reg = /.+?\:\/\/.+?(\/.+?)(?:#|\?|$)/;
    var pathname = reg.exec(event.currentTarget.href);
    // route the URL
    if (pathname == null) { Router.navigate("", true); }
    else { pathname = pathname[1]; }
    Router.navigate(pathname, true);
}

/*----------------------- init ---------------------------*/


Router = new myAppRouter;

// use HTML5 pushState when available
Backbone.history.start({pushState: true});