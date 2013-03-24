/* 1. Router set page
*  2. Template loads page (check auth)
*/

var myAppRouter = Backbone.Router.extend({
    routes: {
        "" : "page_index",
        "login": "page_login",
        "campaign": "campaign",
        "manage": "manage",
        "account": "account"
    },
    page_index: view_index,
    page_login: view_login
});

function view_index(url_path) { Session.set("page", "index"); };
function view_login(url_path) { Session.set("page", "login"); };

function isAuth() {
    return (Meteor.user() != null) ? true : false;
}

Template.page_controller.view = function() {
    if (isAuth()) {
        Router.navigate('');
        return Template['page_index']();
    } else {
        Router.navigate('login');
        return Template['page_login']();
    }
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

Template.page_content.view = function() {
    /*var p = Session.get("page");
    if (p == "index") { return Template['overview'](); }*/
    return Template['overview']();
}

/*----------------------- init ---------------------------*/


Router = new myAppRouter;

// use HTML5 pushState when available
Backbone.history.start({pushState: true});

function router_navigation(event) {
    // prevent default browser link click behavior
    event.preventDefault();
    // get the path from the link
    var  reg = /.+?\:\/\/.+?(\/.+?)(?:#|\?|$)/;
    var pathname = reg.exec(event.currentTarget.href)[1];
    // route the URL
    Router.navigate(pathname, true);
}

/*Template.index.events = {
 'click .myapp' : router_navigation
 };*/