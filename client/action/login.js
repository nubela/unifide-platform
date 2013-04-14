Template.page_login.rendered = function() {
    $('body').css('background', 'url("/media/img/login-bg.png") no-repeat center center fixed');
}

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
    },
    'click #register-nav': function(event) {
        event.preventDefault();
        var box = $('.slide-login');
        box.animate({opacity: 0}, 500, function() {
            var box2 = Template['page_login_register']();
            $(box).html(box2);
            box.animate({'left': '+=400'}, 50, function() {
                $('.slide-login').css({'opacity': 1});
                $('.slide-login').animate({'left': '-=400'}, 500);
            });
        });
    },
    'click #login-nav': function(event) {
        event.preventDefault();
        var box = $('.slide-login');
        box.animate({opacity: 0}, 500, function() {
            var box2 = Template['page_login']();
            var box3 = $(box2).children()[0];
            $(box).html($(box3).children());
            box.animate({'left': '-=400'}, 50, function() {
                $('.slide-login').css({'opacity': 1});
                $('.slide-login').animate({'left': '+=400'}, 500);
            });
        });
    },
    'focus .login-input': function(event) {
        $(event.target).parent().parent().css({'border-left': '4px solid #2d89ef', 'background-color': '#f5f5f5'});
        $(event.target).parent().parent().css({'padding-left': '36px'});
    },
    'blur .login-input': function(event) {
        $(event.target).parent().parent().css({'border-left': '', 'background-color': ''});
        $(event.target).parent().parent().css({'padding-left': '40px'});
    },
    'mouseenter .login-box-register': function(event) {
        $(event.target).css({'-moz-opacity': '0.6', '-webkit-opacity': '0.6', 'opacity': '0.6'});
    },
    'mouseleave .login-box-register': function(event) {
        $(event.target).css({'-moz-opacity': '0.25', '-webkit-opacity': '0.25', 'opacity': '0.25'});
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