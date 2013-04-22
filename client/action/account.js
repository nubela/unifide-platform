/*
 Session variables list

 - selected_brand (currently selected brand globally)
 - account_brand (the selected brand to view account settings)

 */

var no_account_added = "No account added";
var no_keywords_added = "No business keywords specified"


Template.account.brands = function () {
    return BrandMappings.find();
}

Template.account.view = function () {
    var account_page = Session.get("page_template").split("_")[1];

    if (account_page == "update") {
        return Template["account_details"]();
    } else if (account_page == "usage") {
        return Template["account_usage"]();
    }

    return Template["account_brand"]();
}

Template.account_brand.rendered = function () {
    var brand = Session.get("account_brand");
    if (BrandMappings.findOne({brand_name: brand}) == undefined) {
        Session.set("account_brand", Session.get("selected_brand"));
        Router.navigate("/account/b/" + Session.get("selected_brand"), {replace: true});
    }

    $('.side-nav li').removeClass("active");
    $($('a[href$="/account/b/' + brand + '"]').children()[0]).addClass("active");

    page_render(this);
}

Template.account_brand.events = {
    'click #add_facebook': function (event) {
        Meteor.call("get_facebook_auth_url", "facebook", Session.get("account_brand"), function (error, result) {
            window.location.href = result;
        });
    },
    'click #get_facebook_pages': function (event) {
        event.preventDefault();
        page_loading(true);
        Meteor.call("get_facebook_pages", Session.get("account_brand"), function (error, result) {
            page_loading(false);
            _FBPages.remove({});
            for (var i = 0; i < result.length; i++) {
                _FBPages.insert({id: result[i].id, name: result[i].name, category: result[i].category});
            }
            $('#facebook_page_modal').modal();
        });
    },
    'click .add_facebook_page': function (event) {
        event.preventDefault();
        var page_name = ($(event.currentTarget).attr("id")).substring(8);
        $('#facebook_page_modal').modal('hide');
        var page = _FBPages.findOne({name: page_name});
        Meteor.call("put_facebook_page", Session.get("account_brand"), page.id, function (error, result) {
        });
    },
    'click #del_facebook_user': function (event) {
        event.preventDefault();
        Meteor.call("del_facebook_user", Session.get("account_brand"), function (error, result) {
        });
    },
    'click #del_facebook_page': function (event) {
        event.preventDefault();
        Meteor.call("del_facebook_page", Session.get("account_brand"), function (error, result) {
        });
    },
    'click #add_twitter': function (event) {

    },
    'click #set-brand-keywords': function (event) {
        bootbox.prompt("What is the keyword?", function (kw) {
            Meteor.call("put_brand_mention_keyword", kw);
        });
    }
}

Template.account_brand.brand = function () {
    return Session.get("account_brand");
}

Template.account_brand.facebook_account = function () {
    var user_fb = FBUsers.findOne({brand_name: Session.get("account_brand")});
    if (user_fb == undefined) {
        return no_account_added;
    }
    else {
        return Template["account_brand_facebook"]();
    }
}

Template.account_brand_facebook.facebook_name = function () {
    return FBUsers.findOne().fb_id;
}

Template.account_brand_facebook.facebook_page = function () {
    var brand_mapping = BrandMappings.findOne({brand_name: Session.get("account_brand")});
    return brand_mapping.facebook
}

Template.account_brand_facebook.page = function () {
    return _FBPages.find();
}

Template.account_brand.facebook_add = function () {
    if (FBUsers.findOne() == undefined) {
        return true;
    }
    else {
        return false;
    }
}

Template.account_brand.twitter_account = function () {
    return no_account_added;
}

Template.account_brand.twitter_add = function () {
    if (TWUsers.findOne() == undefined) {
        return true;
    }
    else {
        return false;
    }
}

Template.account_brand.foursquare_account = function () {
    return no_account_added;
}

Template.account_brand.foursquare_add = function () {
    if (FSQUsers.findOne() == undefined) {
        return true;
    }
    else {
        return false;
    }
}

Template.account_brand.brand_keywords = function () {
    return Keywords.find({});
}

Template.account_details.rendered = function () {
    $('.side-nav li').removeClass("active");
    $($('a[href$="/account/update"]').children()[0]).addClass("active");

    page_render(this);
}

Template.account_usage.rendered = function () {
    $('.side-nav li').removeClass("active");
    $($('a[href$="/account/usage"]').children()[0]).addClass("active");

    page_render(this);
}

function page_loading(bool) {
    if (bool) {
        $('body').css({"cursor": "progress"});
    }
    else {
        $('body').css({"cursor": "auto"});
    }
}

function page_render(obj) {
    $(obj.firstNode).css({'opacity': 0});
    $(obj.firstNode).css({'position': 'relative', 'left': 100});
    $(obj.firstNode).animate({'opacity': 1, 'left': '0'}, 100);
}