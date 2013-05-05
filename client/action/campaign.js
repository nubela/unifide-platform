var campaign_default_template = "campaign_list";

Template.campaign.view = function() {
    var parse = Session.get("page_template").split("_");
    if (parse.length > 1) {
        return Template[Session.get("page_template")]();
    }

    return Template[campaign_default_template]();
}

Template.campaign.events = {
    'click #platform-all': function() {
        if ($('#platform-all').text() == 'Select all') { $('.platform').find(":checkbox").prop('checked', true); $('#platform-all').text('Unselect all'); }
        else { $('.platform').find(":checkbox").prop('checked', false); $('#platform-all').text('Select all'); }
    },
    'click .platform-check': function() {
        var checked = $('.platform').find(":checkbox:checked").length;
        var total = $('.platform').find(":checkbox").length;
        if (checked == total) { $('#platform-all').text('Unselect all'); }
        else { $('#platform-all').text('Select all') }
    },
    'click #btn-publish': function() {
        Meteor.call("http_api", "put", "campaign/data/", load_content({}, $('.campaign-type').val(), "published"), function(error, result) {
            if (result.statusCode !== 200) { console.log(result.error); }
            else { Router.navigate('campaign', true); }
        });
    },
    'click #btn-schedule': function() {
        $('#schedule-date').datetimepicker({
            pickTime: false
        });
        $('#schedule-time').datetimepicker({
            pickDate: false,
            pick12HourFormat: true,
            pickSeconds: false
        });
        $('#schedule_modal').modal();
    },
    'click #btn-schedule-modal': function() {
        var args = load_content({}, $('.campaign-type').val(), "scheduled")
        args["scheduled_datetime"] = load_scheduled_datetime();
        Meteor.call("http_api", "put", "campaign/data/", args, function(error, result) {
            $('#schedule_modal').modal('hide');
            if (result.statusCode !== 200) { console.log(result.error); }
            else { Router.navigate('campaign', true); }
        });
    }
}

Template.campaign_promo_new.rendered = function() {
    input_change('#campaign-title', '.char-count');
    $('#desc-editor').wysihtml5();

    page_render(this);
}

Template.campaign_event_new.rendered = function() {
    input_change('#campaign-title', '.char-count');
    $('#event-date').datetimepicker({
        pickTime: false
    });
    $('#event-time-start').datetimepicker({
        pickDate: false,
        pick12HourFormat: true,
        pickSeconds: false
    });
    $('#event-time-end').datetimepicker({
        pickDate: false,
        pick12HourFormat: true,
        pickSeconds: false
    });
    $('#desc-editor').wysihtml5();

    page_render(this);
}

Template.campaign_list.campaigns = function() {
    var selected_brand = Session.get("selected_brand");
    _CampaignsList.remove({});

    var client_mapping = Mappings.find({}, {limit: 10}).fetch();
    for (var i=0;i<client_mapping.length;i++) {
        var campaign_obj, facebook_obj, twitter_obj, foursquare_obj;
        console.log(client_mapping[i]);
        if (client_mapping[i].campaign != undefined) {
            campaign_obj = Campaigns.findOne({_id: client_mapping[i].campaign});
        }
        if (client_mapping[i].facebook != undefined) {
            facebook_obj = FBPosts.findOne({_id: client_mapping[i].facebook});
        }
        if (client_mapping[i].twitter != undefined) {
            twitter_obj = TWTweets.findOne({_id: client_mapping[i].twitter});
        }
        if (client_mapping[i].foursquare != undefined) {
            foursquare_obj = FSQPageUpdates.findOne({_id: client_mapping[i].foursquare});
        }

        _CampaignsList.insert({campaign: campaign_obj, facebook: facebook_obj, twitter: twitter_obj, foursquare: foursquare_obj});
        campaign_obj = null, facebook_obj = null, twitter_obj = null, foursquare_obj = null;
    }

    return _CampaignsList.find();
}

Template.campaign_list.rendered = function() {
    page_render(this);
}

function input_change(id, display_div) {
    $(id).bind('input propertychange', function() {
        $(display_div).text(this.value.length + " characters")
    })
}

function load_content(args, type, state) {
    var selected_platforms = $('.platform').find(":checkbox:checked");
    var platforms = "";
    for (var i=0;i<selected_platforms.length;i++) { platforms += selected_platforms[i].value + ","; }

    args["user_id"] = Meteor.userId();
    args["brand_name"] = Session.get("selected_brand");
    args["platform"] = platforms.substr(0, platforms.length-1);
    args["type"] = type;
    args["title"] = $('#campaign-title').val();
    args["description"] = $('#desc-editor').val();
    args["state"] = state;

    if ($('.campaign-post-datetime') != undefined) {
        var date = $('.campaign-post-date-input').val();
        var time_start = $('.campaign-post-time-from-input').val();
        var time_end = $('.campaign-post-time-to-input').val();
        if (time_start) {
            var epoch_start = new Date(date + " " + time_start).getTime()/1000;
            args["datetime_start"] = epoch_start;
        }
        if (time_end) {
            var epoch_end = new Date(date + " " + time_end).getTime()/1000;
            args["datetime_end"] = epoch_end;
        }
    }

    return args;
}


function load_scheduled_datetime(){
    var date = $('.campaign-post-date-input-schedule').val();
    var time = $('.campaign-post-time-from-input-schedule').val();
    var epoch = new Date(date + " " + time).getTime()/1000;
    return epoch;
}

function page_render(obj) {
    $(obj.firstNode).css({'opacity': 0});
    $(obj.firstNode).css({'position': 'relative', 'left': 100});
    $(obj.firstNode).animate({'opacity': 1, 'left': '0'}, 100);
}