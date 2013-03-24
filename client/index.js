var myAppRouter = Backbone.Router.extend({
    routes: {
        "login": "page_login",
        "" : "page_index"
    },
    page_index: view_index,
    page_login: view_login
});

function isAuth() {
    return Meteor.userId == null ? true : false;
}

function view_index(url_path) {
    if (!isAuth()) {
        Router.navigate("login", true)
    }
};

function view_login(url_path) {
    Session.set('view', 'login');
}

Template.page_controller.display_page = function() {
    return Template['page_index']();
}

Template.page_controller.login_page = function() {
    return Template['page_login']();
}

Template.page_login.events = {
    'click #login': function() {
        alert('tested and working');
    },
    'click #signup': function() {
        Accounts.createUser({
            username: $('#signupUser').val(),
            email: $('#signupEmail').val(),
            password: $('#signupPass').val()
        }, createUser_callback)
    }
}

function createUser_callback(error) {
    if (error == null) {
        Router.navigate("cp", true);
    } else {
        alert('error signing up');
    }
}

/*Template.index.events = {
 'click .myapp' : router_navigation
 };*/


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