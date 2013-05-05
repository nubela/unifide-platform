var campaign_default_template = "campaign_list";
var platforms = ["facebook", "twitter", "foursquare", "campaign", "blog", "push"];


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

Template.campaign_list.rendered = function() {
    $('.selection input:checkbox').change(function() {
        var selected = $('.selection input:checkbox:checked').length;
        var total = $('.selection input:checkbox').length;
        if (selected > 0) {
            $('.selected-buttons').css('display', 'block');
        } else {
            $('.selected-buttons').css('display', 'none');
        }

        if (selected === total) { $('#select-all').html('<i class="icon-ok"></i> Unselect All'); }
        else { $('#select-all').html('<i class="icon-ok"></i> Select All'); }
    })
}

Template.campaign_list.events = {
    'click .page-back': function() {
        var page = Session.get("campaign_list_page");
        if (page == 1) { return; }
        else { Session.set("campaign_list_page", (page-1)); }
    },
    'click .page-next': function() {
        var page = Session.get("campaign_list_page");
        var total = Template.campaign_list.total();
        if (page >= (total/10)) { return; }
        else { Session.set("campaign_list_page", (page+1)); }
    },
    'click #select-all': function(event) {
        var selected = $('.selection input:checkbox:checked').length;
        var total = $('.selection input:checkbox').length;

        if (selected === total) {
            $('.selection input:checkbox').prop('checked', false);
            $('#select-all').html('<i class="icon-ok"></i> Select All');
        } else {
            $('.selection input:checkbox').prop('checked', true);
            $('#select-all').html('<i class="icon-ok"></i> Unselect All');
        }

        selected = $('.selection input:checkbox:checked').length;
        if (selected > 0) {
            $('.selected-buttons').css('display', 'block');
        } else {
            $('.selected-buttons').css('display', 'none');
        }
    },
    'click .expand-all': function(event) {
        $('.collapse').collapse('show');
        $('.expand-all').html('<i class="icon-arrow-down"></i> Collapse All');
        $(event.currentTarget).addClass('collapse-all').removeClass('expand-all');
    },
    'click .collapse-all': function(event) {
        $('.collapse').collapse('hide');
        $('.collapse-all').html('<i class="icon-arrow-down"></i> Expand All');
        $(event.currentTarget).addClass('expand-all').removeClass('collapse-all');
    },
    'click .expanded-edit': function(event) {
        console.log('load edit modal');
    },
    'click .delete-campaign': function(event) {
        var checked = $('.selection input:checkbox:checked');
        var campaign_list = [];
        for (var i=0;i<checked.length;i++) {
            campaign_list.push($(checked[i]).val());
        }

        Meteor.call('http_api', 'del', 'campaign/?user_id=' + Meteor.userId() +
                                                "&brand_name=" + Session.get("selected_brand") +
                                                "&campaign_list=" + campaign_list,
            function(error, result) {
            if (result.statusCode !== 200) { console.log(result.error); }
        });
    }
}

Template.campaign_list.total = function() {
    return Mappings.find().count();
}

Template.campaign_list.list_page = function() {
    Session.setDefault("campaign_list_page", 1);
    return Session.get("campaign_list_page");
}

Template.campaign_list.campaigns = function() {
    var offset = (Session.get("campaign_list_page") * 10) - 10;
    var mappings = Mappings.find({}, {limit: 10, skip: offset}).fetch();
    _CampaignsList.remove({});
    for (var i=0;i<mappings.length;i++) { _CampaignsList.insert(computeCampaign(mappings[i])); }

    return _CampaignsList.find().fetch();
}

function computeCampaign(mapping) {
    var dict = {id: "", type: "", platforms: "", title: "", obj_title: "", obj_desc: "", state: "", created: "", scheduled: "", expanded: "" };
    var time_now = new Date().getTime();

    dict["id"] = mapping._id.toHexString();
    dict["type"] = mapping.type;

    for (var i=0;i<platforms.length;i++) {
        if (mapping[platforms[i]]) {
            if (mapping[platforms[i]] === "push") {
                dict["platforms"] += '<div class="type-ios pull-left"></div><div class="type-android pull-left"></div>'
                continue;
            }
            dict["platforms"] += '<div class="type-' + platforms[i] + ' pull-left"></div>';
        }
    }

    // web/mobile campaign
    if (mapping.campaign || mapping.blog) {
        var campaign = Campaigns.findOne({_id: mapping.campaign});
        dict["title"] = campaign ? wrapBold(campaign.title) + " - " + wrapGray(stripHTML(campaign.description)) : "";
        dict["obj_title"] = campaign ? campaign.title : "";
        dict["obj_desc"] = campaign ? campaign.description : "";
    }
    // web/mobile blog
    else if (mapping.blog) {
        var campaign = Campaigns.findOne({_id: mapping.campaign});
        dict["title"] = campaign ? wrapBold(campaign.title) + " - " + wrapGray(stripHTML(campaign.description)) : "";
        dict["obj_title"] = campaign ? campaign.title : "";
        dict["obj_desc"] = campaign ? campaign.description : "";
    }
    // facebook event
    else if (mapping.facebook && mapping.type === "event") {
        var fb = FBEvents.findOne({_id: mapping.facebook});
        dict["title"] = fb ? wrapBold(fb.fields.name) + " - " + wrapGray(stripHTML(fb.fields.description)) : "";
        dict["obj_title"] = fb ? fb.fields.name : "";
        dict["obj_desc"] = fb ? fb.fields.description : "";
    // facebook status/link/photo
    } else if (mapping.facebook && mapping.type === "promotion") {
        var fb = FBPosts.findOne({_id: mapping.facebook});
        dict["title"] = fb ? wrapBold(fb.fields.message) : "";
        dict["obj_title"] = fb ? fb.fields.message : "";
    // twitter tweet
    } else if (mapping.twitter) {
        var tw = TWTweets.findOne({_id: mapping.twitter});
        dict["title"] = tw ? wrapBold(tw.fields.text) : "";
        dict["obj_title"] = tw ? tw.fields.text : "";
    // foursquare page update
    } else if (mapping.foursquare) {
        var fsq = FSQPageUpdates.findOne({_id: mapping.foursquare});
        dict["title"] = fsq ? "" : "";
        dict["obj_title"] = fsq ? "" : "";
    }

    dict["state"] = mapping.state === "published" ? "<i class='icon-ok-sign'></i>" : "<i class='icon-time'></i>"
    dict["created"] = timeDifference(time_now, new Date(mapping.timestamp_utc).getTime());
    dict["expanded"] = loadCampaignCard(mapping, dict);

    return dict;
}

function loadCampaignCard(mapping, dict) {
    var card = '';
    var title = dict["obj_title"];
    var desc = dict["obj_desc"];

    card += '<div class="expanded-title">' + title + '</div>';
    card += desc ? '<div class="expanded-desc">' + desc + '</div>' : '';
    card += '<hr>';

    var ts = new Date(mapping.timestamp_utc);
    var scheduled = new Date(mapping.publish_datetime);
    card += '<div class="expanded-edit pull-left"><i class="icon-edit"></i> Edit campaign</div>';
    card += mapping.state === "published" ? '<span class="expanded-datetime pull-left">Published on ' + ts.toDateString() + ' ' + ts.toLocaleTimeString() + '</span>' :
                                            '<span class="expanded-datetime pull-left">Scheduled to publish on ' + scheduled.toDateString() + ' ' + scheduled.toLocaleTimeString() + '</span>';
    card += '<div class="clear"></div>';

    return card;
}

function wrapBold(val) {
    return "<span class='title-bold'>" + val + "</span>";
}

function wrapGray(val) {
    return "<span class='title-gray'>" + val + "</span>";
}

function stripHTML(val) {
    val = val.replace(/\<br\>/g," ");
    return val.replace(/<(?:.|\n)*?>/gm, '');
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

function timeDifference(current, previous, format) {
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
        return format ? d.toDateString() + " " + d.toLocaleTimeString() : d.toDateString();
    }
}