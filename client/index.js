/* 1. Router set page
*  2. Template loads page (check auth)
*/

var myAppRouter = Backbone.Router.extend({
    routes: {
        "" : "page_index",
        "login": "page_login",
        "facebook": "page_facebook",
        "twitter": "page_twitter",
        "foursquare": "page_foursquare",
        "brand_mention": "page_brand_mention",
        "web_platform": "page_web_platform",
        "ios_platform": "page_ios_platform",
        "android_platform": "page_android_platform",
        "campaign": "page_campaign",
        "campaign/new/status": "campaign_new_status",
        "manage": "page_manage",
        "account": "page_account"
    },
    page_index: view_index,
    page_login: view_login,
    page_facebook: view_facebook,
    page_twitter: view_twitter,
    page_foursquare: view_foursquare,
    page_brand_mention: view_brand_mention,
    page_web_platform: view_web_platform,
    page_ios_platform: view_ios_platform,
    page_android_platform: view_android_platform,
    page_campaign: view_campaign,
    campaign_new_status: view_campaign_new_status,
    page_manage: view_manage,
    page_account: view_account
});

function view_index(url_path) { Session.set("page", "overview"); };
function view_login(url_path) { Session.set("page", "login"); };
function view_facebook(url_path) { Session.set("page", "facebook"); };
function view_twitter(url_path) { Session.set("page", "twitter"); };
function view_foursquare(url_path) { Session.set("page", "foursquare"); };
function view_brand_mention(url_path) { Session.set("page", "brand-mention"); };
function view_web_platform(url_path) { Session.set("page", "web-platform"); };
function view_ios_platform(url_path) { Session.set("page", "ios-platform"); };
function view_android_platform(url_path) { Session.set("page", "android-platform"); };
function view_campaign(url_path) { Session.set("page", "campaign"); };
function view_campaign_new_status(url_path) { Session.set("page", "campaign_new_status"); };
function view_manage(url_path) { Session.set("page", "manage"); };
function view_account(url_path) { Session.set("page", "account"); };

function isAuth() {
    return (Meteor.user() != null) ? true : false;
}

Template.page_controller.view = function() {

    if (Meteor.loggingIn()) { return; }
    if (Session.get("page") == undefined) { return; }

    if (isAuth()) {
        var parse = Session.get("page").split("_");
        var parse_url = "";
        for (var i=0;i<parse.length;i++) { parse_url += parse[i] + "/"; }
        if (parse_url[parse_url.length-1] == '/') { parse_url = parse_url.substring(0, parse_url.length-1); }
        Router.navigate(parse_url, true);
        return Template['page_index']();
    } else {
        Router.navigate('login', true);
        return Template['page_login']();
    }
}

Template.page_content.view = function() {
    /*var p = Session.get("page");
    if (p == "index") { return Template['overview'](); }
    else if (p == "campaign") { return Template['campaign'](); }
    else if (p == "manage") { return Template['manage'](); }
    else if (p == "account") { return Template['account'](); }
    return load_overview();*/
    var parse = Session.get("page").split("_");
    if (parse.length == 1) {
        return Template[Session.get("page").split("_")[0]]();
    } else {
        return Template[Session.get("page")]();
    }
}

Meteor.startup(function() {
    Deps.autorun(function() {
        Meteor.subscribe("facebook", {posts_offset: 0, comments_offset: 0});
        Meteor.subscribe("facebook_attr");
        Meteor.subscribe("twitter");
    });
});

function load_overview(){
    return Template['overview']();
}

Template.overview.facebook_overview = function() {
    _FBOverview.remove({});
    var client_FBPosts = FBPosts.find().fetch();
    for (var i=0;i<client_FBPosts.length;i++) {
        var client_FBComments = FBComments.find({post_id: client_FBPosts[i].post_id}).fetch();
        if (client_FBComments.length == 0) { continue; } // no comments/conversations, skip post
        for (var x=0;x<client_FBComments.length;x++) {
            if (i+1 < client_FBPosts.length) {
                if (client_FBComments[x].created_time > client_FBPosts[i+1].updated_time) {
                    var user_name = (_FBUsers.findOne({id: client_FBComments[x].user}) != undefined) ? _FBUsers.findOne({id: client_FBComments[x].user}).name : ""
                    _FBOverview.insert({post: client_FBPosts[i], comment: client_FBComments[x], username: user_name});
                }
            } else {
                var user_name = (_FBUsers.findOne({id: client_FBComments[x].user}) != undefined) ? _FBUsers.findOne({id: client_FBComments[x].user}).name : ""
                _FBOverview.insert({post: client_FBPosts[i], comment: client_FBComments[x], username: user_name});
            }

            if (_FBOverview.find({}, {reactive: false}).count() == 5) { break; }
        }
        if (_FBOverview.find({}, {reactive: false}).count() == 5) { break; }
    }

    return _FBOverview.find();
}

Template.overview.twitter_overview = function() {
    _TWOverview.remove({});
    var client_TWTweets = TWTweets.find({}, {sort:{created_at: -1}}).fetch();
    for (var i=0;i<client_TWTweets.length;i++) {
        if (_TWOverview.find({}, {reactive: false}).count() == 0) { _TWOverview.insert({tweet: client_TWTweets[i], tweeter: _TWUsers.findOne({tw_id: client_TWTweets[i].user})}); continue; }
        if (client_TWTweets[i].created_at < client_TWTweets[i-1].created_at) { _TWOverview.insert({tweet: client_TWTweets[i], tweeter: _TWUsers.findOne({tw_id: client_TWTweets[i].user})});}
        if (_TWOverview.find({}, {reactive: false}).count() == 4) { break;}
    }

    return _TWOverview.find();
}

Template.campaign.view = function() {
    var parse = Session.get("page").split("_");
    if (parse.length > 1) {
        if (parse[1] == "new") {
            return Template['campaign-new-status']();
        }
    }

    return Template['campaign-manage']();
}

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