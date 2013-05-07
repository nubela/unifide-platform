var web_default_template = "web_campaign_activity";

Template.web.view = function() {
    var parse = Session.get("page_template").split("_");
    if (parse.length > 1) {
        return Template[Session.get("page_template")]();
    }

    return Template[web_default_template]();
}

Template.web_campaign_activity.events = {
    'click .page-back': function() {
        var page = Session.get("campaign_activity_page");
        if (page == 1) { return; }
        else { Session.set("campaign_activity_page", (page-1)); }
    },
    'click .page-next': function() {
        var page = Session.get("campaign_activity_page");
        var total = Template.web_campaign_activity.total();
        if (page >= (total/10)) { return; }
        else { Session.set("campaign_activity_page", (page+1)); }
    }
}

Template.web_campaign_activity.check_web = function() {
    if (Campaigns.find().count() == 0) { return false; }
    return true;
}

Template.web_campaign_activity.total = function() {
    var time_now = new Date().getTime();
    _CampaignActivity.remove({}, {reactive: false});

    var mappings = Mappings.find({$or: [{campaign: {$ne: null}}, {blog: {$ne: null}}], state: "published"}).fetch();
    for (var i=0;i<mappings.length;i++) {
        var m = mappings[i];
        var content = getContentCampaign(m);
        _CampaignActivity.insert({platforms: loadPlatforms(m),
                            event: loadEventDetails(content),
                            title: content.title,
                            description: stripHTML(content.description),
                            datetime: timeDifference(time_now, new Date(m.timestamp_utc))});
    }

    return _CampaignActivity.find().count();
}

Template.web_campaign_activity.activity_page = function() {
    Session.setDefault("campaign_activity_page", 1);
    return Session.get("campaign_activity_page");
}

Template.web_campaign_activity.activity_list = function() {
    var offset = (Session.get("campaign_activity_page") * 10) - 10;
    return _CampaignActivity.find({}, {limit: 10, skip: offset}).fetch();
}

function getContentCampaign(mapping) {
    var objId = mapping.campaign ? mapping.campaign : mapping.blog;
    return Campaigns.findOne({_id: objId});
}

function loadPlatforms(mapping) {
    var val = "";

    if (mapping.campaign) { val += '<div class="web-platform-icon-web pull-left"></div>'; }
    if (mapping.blog) { val += '<div class="web-platform-icon-blog pull-left"></div>' }
    if (mapping.push) {
        val += '<div class="web-platform-icon-android pull-left"></div>';
        val += '<div class="web-platform-icon-ios pull-left"></div>'
    }

    return val;
}

function loadEventDetails(content) {
    var val = "";
    var event_start = value_check(content, "happening_datetime_start");
    var event_end = value_check(content, "happening_datetime_end");

    if (event_start) {
        var startDate = getTimeFromUTC(event_start);
        val += '<div class="expanded-event-datetime"><i class="icon-calendar"></i> ' + startDate.toDateString() + '<span class="expanded-event-start"><i class="icon-time"></i> ' + startDate.toLocaleTimeString();
    }
    if (event_end) { var endDate = getTimeFromUTC(event_end); val += ' until ' + endDate.toLocaleTimeString(); }
    if (event_start) { val += '</span></div>'; }

    return val;
}

function value_check(obj, attr) {
    if (obj) { return obj[attr] ? obj[attr] : undefined; }
    else return undefined;
}

function getTimeFromUTC(epoch) {
    var d = new Date(0);
    d.setUTCSeconds(epoch);
    return d;
}

function stripHTML(val) {
    val = val.replace(/\<br\>/g," ");
    return val.replace(/<(?:.|\n)*?>/gm, '');
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