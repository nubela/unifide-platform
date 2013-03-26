Template.page_login.events = {
    'click #login': function() {
        Meteor.loginWithPassword($("#loginUser").val(), $("#loginPass").val(), loginUser_callback);
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
        Router.navigate("", true);
    } else {
        alert("error signing up");
    }
}

function loginUser_callback(error) {
    if (error == null) {
        Router.navigate("", true);
    } else {
        alert("Error logging in.");
    }
}