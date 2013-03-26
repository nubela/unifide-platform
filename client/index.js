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
    return Template['overview']();
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
    alert('triggered');
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