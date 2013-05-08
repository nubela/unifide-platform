var foursquare_default_template = "foursquare_venue_activity"

Template.foursquare.view = function() {
    var parse = Session.get("page_template").split("_");
    if (parse.length > 1) {
        return Template[Session.get("page_template")]();
    }

    return Template[foursquare_default_template]();
}

Template.foursquare_venue_activity.events = {
    'click .page-back': function() {
        var page = Session.get("foursquare_activity_page");
        if (page == 1) { return; }
        else { Session.set("foursquare_activity_page", (page-1)); }
    },
    'click .page-next': function() {
        var page = Session.get("foursquare_activity_page");
        var total = Template.foursquare_venue_activity.total();
        if (page >= (total/10)) { return; }
        else { Session.set("foursquare_activity_page", (page+1)); }
    }
}

Template.foursquare_venue_activity.check_foursquare = function() {
    var brand_obj = detect_selected_brand(Session.get("selected_brand"), "foursquare");
    if (!brand_obj) { return false; }
    if (!brand_obj.id || (FSQTips.find().count() == 0 && FSQPageUpdates.find().count() == 0)) { return false; }
    return true;
}

Template.foursquare_venue_activity.activity_page = function() {
    Session.setDefault("foursquare_activity_page", 1);
    return Session.get("foursquare_activity_page");
}

Template.foursquare_venue_activity.activity_list = function() {
    var offset = (Session.get("foursquare_activity_page") * 10) - 10;
    return _FSQActivity.find({}, {sort: {created_utc: -1}, limit: 10, skip: offset}).fetch();
};

Template.foursquare_venue_activity.total = function() {
    _FSQActivity.remove({}, {reactive: false});

    var page_tip = FSQTips.find({}, {sort: {"fields.createdAt": -1}}).fetch();
    var page_updates = FSQPageUpdates.find({}, {sort: {"fields.createdAt": -1}}).fetch();

    for (var i=0;i<page_updates.length;i++) {
        _FSQActivity.insert(getFSQUpdateOverview(page_updates[i]));
    }

    for (var i=0;i<page_tip.length;i++) {
        _FSQActivity.insert(getFSQPageTipOverview(page_tip[i]));
    }

    return _FSQActivity.find({}, {reactive: false}).count();
}

function getFSQUpdateOverview(pageupdate) {
    var time_now = new Date().getTime();
    return {
        user: {
            image: pageupdate.fields.creator.photo.prefix + "64x64" + pageupdate.fields.creator.photo.suffix,
            name: pageupdate.fields.creator.firstName,
            id: pageupdate.fields.creator.id
        },
        text: pageupdate.fields.shout,
        createdAt: timeDifference(time_now, getTimeFromUTC(pageupdate.fields.createdAt)),
        created_utc: pageupdate.fields.createdAt,
        canonicalUrl: pageupdate.fields.canonicalUrl,
        type: "page update"
    }
}

function getFSQPageTipOverview(pagetip) {
    var time_now = new Date().getTime();
    return {
        user : {
            image: pagetip.fields.user.photo.prefix + "64x64" + pagetip.fields.user.photo.suffix,
            name: pagetip.fields.user.firstName,
            id: pagetip.fields.user.id
        },
        text: pagetip.fields.text,
        createdAt: timeDifference(time_now, getTimeFromUTC(pagetip.fields.createdAt)),
        created_utc: pagetip.fields.createdAt,
        canonicalUrl: pagetip.fields.canonicalUrl,
        type: "page tip"
    }
}

function getTimeFromUTC(epoch) {
    var d = new Date(0);
    d.setUTCSeconds(epoch);
    return d;
}

function detect_selected_brand(brand, platform) {
    if (BrandMappings.findOne({uid: Meteor.userId(), brand_name: brand}) == undefined) { return null; }
    var brand_obj = (BrandMappings.findOne({uid: Meteor.userId(), brand_name: brand}))[platform];
    if (brand_obj == undefined) { return null }
    return brand_obj;
}

function timeDifference(current, previous) {
    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
         return Math.round(elapsed/1000) + ' seconds ago';
    }
    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';
    }
    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';
    }
    /*else if (elapsed < msPerMonth) {
        return Math.round(elapsed/msPerDay) + ' days ago';
    }*/
    else {
        var d = new Date(previous);
        return "on " + d.toDateString() + " " + d.toLocaleTimeString();
    }
}