/*
 Session variables list

 - selected_brand (currently selected brand globally)
 - account_brand (the selected brand to view account settings)
 - twitter_token (used for twitter oauth)
 - twitter_token_secret (used for twitter oauth)

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
            clear_cache();
        });
    },
    'click #add_twitter': function (event) {
        Meteor.call("get_twitter_auth_url", "twitter", Session.get("account_brand"), function (error, result) {
            window.location.href = result.auth_url;
        });
    },
    'click #del_twitter_user': function (event) {
        Meteor.call("del_twitter_user", Session.get("account_brand"), function (error, result) {
        });
    },
    'click #add_foursquare': function (event) {
        Meteor.call("get_foursquare_auth_url", "foursquare", Session.get("account_brand"), function (error, result) {
            window.location.href = result;
        });
    },
    'click #get_foursquare_venues_managed': function (event) {
        event.preventDefault();
        page_loading(true);
        Meteor.call("get_foursquare_venues_managed", Session.get("account_brand"), function (error, result) {
            page_loading(false);
            _FSQVenues.remove({});
            for (var i=0;i<result.length;i++) {
                _FSQVenues.insert(result[i]);
            }
            $('#foursquare_venue_modal').modal();
        });
    },
    'click .add_foursquare_venue': function (event) {
        event.preventDefault();
        var venue_id = ($(event.currentTarget).attr("id")).substring(10);
        $('#foursquare_venue_modal').modal('hide');
        var venue = _FSQVenues.findOne({id: venue_id});
        Meteor.call("put_foursquare_venue", Session.get("account_brand"), venue.id, function (error, result) {
        });
    },
    'click .del_foursquare_venue': function (event) {
        event.preventDefault();
        var venue_id = ($(event.currentTarget).attr("id")).substring(21);
        Meteor.call("del_foursquare_venue", Session.get("account_brand"), venue_id, function (error, result) {
        });

    },
    'click #del_foursquare_user': function (event) {
        event.preventDefault();
        Meteor.call("del_foursquare_user", Session.get("account_brand"), function (error, result) {
        });
    },
    'click #set-brand-keywords': function (event) {
        bootbox.prompt("What is the keyword?", function (kw) {
            Meteor.call("put_brand_mention_keyword", kw);
        });
    },
    'click .brand-keywords': function (event) {
        var span = event.target;
        var keyword_text = $(span).text();
        bootbox.confirm("Would you like to delete " + keyword_text + "?", function (res) {
            if (res) {
                Meteor.call("del_brand_mention_keyword", keyword_text);
            }
        });
    }
}

Template.account_brand.brand = function () {
    return Session.get("account_brand");
}

Template.account_brand.accounts = function() {
    if (!Template.account_brand.facebook_add() && !Template.account_brand.twitter_add() && !Template.account_brand.foursquare_add()) {
        return false;
    } else { return true; }
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

Template.account_brand_facebook.page = function() {
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
    var user_tw = TWUsers.findOne({brand_name: Session.get("account_brand")});
    if (user_tw == undefined) {
        return no_account_added;
    } else {
        return Template["account_brand_twitter"]();
    }
}

Template.account_brand_twitter.twitter_name = function() {
    return TWUsers.findOne({brand_name: Session.get("account_brand")}).tw_id;
}

Template.account_brand.twitter_add = function () {
    if (TWUsers.findOne({"brand_name": Session.get("account_brand")}) == undefined) {
        return true;
    }
    else {
        return false;
    }
}

Template.account_brand.foursquare_account = function () {
    var user_fsq = FSQUsers.findOne({brand_name: Session.get("account_brand")});
    if (user_fsq == undefined) { return no_account_added; }
    else {
        return Template["account_brand_foursquare"]();
    }
}

Template.account_brand.foursquare_add = function () {
    if (FSQUsers.findOne({brand_name: Session.get("account_brand")}) == undefined) {
        return true;
    }
    else {
        return false;
    }
}

Template.account_brand_foursquare.foursquare_name = function() {
    return FSQUsers.findOne({brand_name: Session.get("account_brand")}).fsq_id;
}

Template.account_brand_foursquare.venue = function() {
    return _FSQVenues.find();
}

Template.account_brand_foursquare.foursquare_venue = function () {
    var brand_mapping = BrandMappings.findOne({brand_name: Session.get("account_brand")})
    if (brand_mapping.foursquare != null) { return "venues" in brand_mapping.foursquare  ? brand_mapping.foursquare.venues[0] : undefined; }
    else { return undefined; }
}

Template.account_brand_foursquare.foursquare_venue_id = function () {
    var brand_mapping = BrandMappings.findOne({brand_name: Session.get("account_brand")})
    if (brand_mapping.foursquare != null) { return "venues" in brand_mapping.foursquare  ? brand_mapping.foursquare.venues[0] : undefined; }
    else { return undefined; }
}

Template.account_brand.brand_keywords = function () {
    return Keywords.find({});
}

Template.account_details.rendered = function () {
    $('.side-nav li').removeClass("active");
    $($('a[href$="/account/update"]').children()[0]).addClass("active");

    page_render(this);
}

Template.account_details.events = {
    'click #edit_brand_name': function() {
        $('#edit_brand_name_modal').modal();
    },
    'click #edit_account_password': function() {
        $('#change_password_modal').on('hide', function() {
            $('#change_password_error').text('');
        })
        $('#change_password_modal').modal();
    },
    'click #edit_account_email': function() {
        $('#change_email_modal').modal();
    },
    'click #edit_brand_name_btn': function() {
        var new_brand = $('#new_brand_name').val()
        var args = {user_id: Meteor.userId(),
                    brand_name: Session.get("account_brand"),
                    new_brand_name: new_brand}
        Meteor.call('http_api', 'put', 'account/info/', args, function(error, result) {
            if (result.statusCode !== 200) {
                console.log(error);
            } else {
                Session.set("account_brand", new_brand);
                Session.set("selected_brand", new_brand);
            }
            $('#edit_brand_name_modal').modal('hide');
        })
    },
    'click #change_password_btn': function() {
        Accounts.changePassword($('#old_pass').val(), $('#new_pass').val(), function(error) {
            if (error) {
                $('#change_password_error').text(error.reason);
                console.log(error);
            } else { $('#change_password_modal').modal('hide'); }
        });
    },
    'click #change_email_btn': function() {
        var args = {user_id: Meteor.userId(),
                    email: $('#new_email').val()};
        Meteor.call('http_api', 'put', 'account/info/', args, function(error, result) {
            if (result.statusCode !== 200) {
                console.log(error);
            } else { $('#change_email_modal').modal('hide'); }
        })
    }
}

Template.account_details.brand_name = function() {
    return Session.get("account_brand");
}

Template.account_details.account_email = function() {
    return Meteor.user().emails[0].address;
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

function clear_cache() {
    _FBOverview.remove({});
    _FBActivity.remove({});
    _TWOverview.remove({});
    _TWActivity.remove({});
    _FSQOverview.remove({});
    _FSQActivity.remove({});
}