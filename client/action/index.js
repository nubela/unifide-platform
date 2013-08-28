Template.page_controller.events = {
    'click .appnav': router_navigation
};

Template.page_controller.rendered = function () {
    $("[data-toggle='tooltip']").tooltip({
            placement: "left"
    })
}

Template.page_controller.view = function() {

    if (Meteor.loggingIn()) { return; }
    if (Session.get("page") == undefined) { return; }

    if (isAuth()) {
        return Template['page_index']();
    } else {
        return Template['page_login']();
    }
};

Template.page_index.rendered = function() {
    $('body').css('background', '#F3F3F3 url("/media/img/pattern_noise.png") 0 0 repeat');
};

Template.header.menu_list = function() {
    return CPMenu.find({}, {sort: {order: 1}});
};

Template.header.username = function() {
    return getUsername();
};

Template.header.brands = function() {
    if (BrandMappings.find().count() == 0) { return; }
    var brand_mapping_obj = BrandMappings.findOne();
    if (brand_mapping_obj != undefined) { Session.setDefault('selected_brand', brand_mapping_obj.brand_name); }

    return BrandMappings.find();
}

Template.header.selected_brand = function() {
    return Session.get("selected_brand");
}

Template.page_index.view = function() {
    return Template[Session.get("page_template").split("_")[0]]();
};

Template.header.events = {
    'click #logout': function(event) {
        event.preventDefault();
        Meteor.logout();
    },
    'click #switch-brand': function(event) {
        event.preventDefault();
        // todo: switch brands implementation
    }
};

/******* utility functions *******/

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

function isAuth() {
    return (Meteor.user() != null) ? true : false;
};

function getUsername() {
    return Meteor.user() != null ? Meteor.user().username : "Loading...";
};