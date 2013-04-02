/* 1. Router set page
*  2. Template loads page (check auth)
*/

var myAppRouter = Backbone.Router.extend({
    routes: {
        "" : "page_index",
        "login": "page_login",
        "campaign": "page_campaign",
        "manage": "page_manage",
        "account": "page_account"
    },
    page_index: view_index,
    page_login: view_login,
    page_campaign: view_campaign,
    page_manage: view_manage,
    page_account: view_account
});

function view_index(url_path) { Session.set("page", "index"); };
function view_login(url_path) { Session.set("page", "login"); };
function view_campaign(url_path) { Session.set("page", "campaign"); };
function view_manage(url_path) { Session.set("page", "manage"); };
function view_account(url_path) { Session.set("page", "account"); };

function isAuth() {
    return (Meteor.user() != null) ? true : false;
}

Template.page_controller.view = function() {

    if (Meteor.loggingIn()) { return; }

    if (isAuth()) {
        Router.navigate('', true);
        return Template['page_index']();
    } else {
        Router.navigate('login', true);
        return Template['page_login']();
    }
}

Template.page_content.view = function() {
    var p = Session.get("page");
    if (p == "campaign") { return Template['campaign'](); }
    else if (p == "manage") { return Template['manage'](); }
    else if (p == "account") { return Template['account'](); }

    return load_overview();
}

Meteor.startup(function() {
    Deps.autorun(function() {
        Meteor.subscribe("facebook", {posts_offset: 0, comments_offset: 0});
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
                    _FBOverview.insert({post: client_FBPosts[i], comment: client_FBComments[x]});
                }
            } else {
                _FBOverview.insert({post: client_FBPosts[i], comment: client_FBComments[x]});
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
        if (_TWOverview.find({}, {reactive: false}).count() == 5) { break;}
    }

    return _TWOverview.find();
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
    return getUsername();
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