Template.page_login.rendered = ->
    $('body').css('background', 'url("/media/img/login-bg.png") no-repeat center center fixed')
    page = Session.get("page")
    p = page.split('/')
    if p[1] == "admin-register"
        box = $('.slide-login')
        $(box).html(Template['page_login_register']())

    $("#login-form").submit (evt) ->
        evt.preventDefault()
        Meteor.loginWithPassword($("#loginUser").val(), $("#loginPass").val(), loginUser_callback)


Template.page_login.events =
    'click #login': ->
        Meteor.loginWithPassword($("#loginUser").val(), $("#loginPass").val(), loginUser_callback)

    'click #signup': ->
        Accounts.createUser {
            username: $('#signupUser').val(),
            email: $('#signupEmail').val(),
            password: $('#signupPass').val()
        }, createUser_callback

    'click #register-nav': (event) ->
        event.preventDefault()
        box = $('.slide-login')
        box.animate {opacity: 0}, 500, ->
            box2 = Template['page_login_register']()
            $(box).html(box2)
            box.animate {'left': '+=400'}, 50, ->
                $('.slide-login').css({'opacity': 1});
                $('.slide-login').animate({'left': '-=400'}, 500)

    'click #login-nav': (event) ->
        event.preventDefault();
        box = $('.slide-login')
        box.animate {opacity: 0}, 500, ->
            box2 = Template['page_login']()
            box3 = $(box2).children()[0]
            $(box).html($(box3).children())
            box.animate {'left': '-=400'}, 50, ->
                $('.slide-login').css({'opacity': 1})
                $('.slide-login').animate({'left': '+=400'}, 500)

    'focus .login-input': (event) ->
        $(event.target).parent().parent().css({'border-left': '4px solid #2d89ef', 'background-color': '#f5f5f5'})
        $(event.target).parent().parent().css({'padding-left': '36px'})

    'blur .login-input': (event) ->
        $(event.target).parent().parent().css({'border-left': '', 'background-color': ''})
        $(event.target).parent().parent().css({'padding-left': '40px'})

    'mouseenter .login-box-register': (event) ->
        $(event.target).css({'-moz-opacity': '0.6', '-webkit-opacity': '0.6', 'opacity': '0.6'})

    'mouseleave .login-box-register': (event) ->
        $(event.target).css({'-moz-opacity': '0.25', '-webkit-opacity': '0.25', 'opacity': '0.25'})

    'click #forgotpassword-nav': (event) ->
        email = prompt("Username to reset ?", "")
        Meteor.call 'get_user_email', email, (error, result) ->
            if !result
                console.log(error)

            else
                console.log(result)
                Accounts.forgotPassword({email: result})


createUser_callback = (error) ->
    if not error?
        Router.navigate("", true)
    else
        bootbox.alert(error)


loginUser_callback = (error) ->
    if not error?
        Router.navigate("", true)
    else
        bootbox.alert("Error logging in. " + error)
