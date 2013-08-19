var CAMPAIGN_CREATION_REDIRECT_TO = "campaign"
var SOCIAL_TYPE = ["facebook", "twitter", "foursquare"];
var WEB_CAMPAIGN_TYPES = [
    { name: "web" },
    { name: "blog" }
];
var DEVICE_CAMPAIGN_TYPES = [
    { name: "push" }
];

var campaign_default_template = "campaign_list";
var platforms = ["facebook", "twitter", "foursquare", "campaign", "blog", "push"];


CAMPAIGN_CHANNEL = {
    FACEBOOK: "facebook",
    TWITTER: "twitter",
    FOURSQUARE: "4sq",
    BLOG: "blog",
    WEB_MOBILE: "web_and_mobile",
    PUSH_NOTIFICATION: "push_notification"
}


Template.campaign.view = function () {
    var parse = Session.get("page_template").split("_");
    if (parse.length > 1) {
        return Template[Session.get("page_template")]();
    }

    return Template[campaign_default_template]();
}

function toggleContentBox() {
    var selected_boxes = $('.platform').find(":checkbox:checked");

    if ($(selected_boxes).hasClass('social-network') || $(selected_boxes).hasClass('unifide-web')) {
        $('.social-content').css('display', 'block');
    }
    else {
        $('.social-content').css('display', 'none')
    }

    if ($(selected_boxes).hasClass('social-network') || $(selected_boxes).hasClass('unifide-web')) {
        $('.add-media').css('display', 'block');
    }
    else {
        $('.add-media').css('display', 'none')
    }

    if ($(selected_boxes).hasClass('unifide-web')) {
        $('.web-content').css('display', 'block');
    }
    else {
        $('.web-content').css('display', 'none')
    }
}

Template.campaign.events = {
    'click #platform-all': function () {
        if ($('#platform-all').text() == 'Select all') {
            $('.platform').find(":checkbox").prop('checked', true);
            $('#platform-all').text('Unselect all');
        }
        else {
            $('.platform').find(":checkbox").prop('checked', false);
            $('#platform-all').text('Select all');
        }

        toggleContentBox();
    },
    'click .platform-check': function () {
        var checked = $('.platform').find(":checkbox:checked").length;
        var total = $('.platform').find(":checkbox").length;
        if (checked == total) {
            $('#platform-all').text('Unselect all');
        }
        else {
            $('#platform-all').text('Select all')
        }

        toggleContentBox();
    },
    'click .add-media-modal': function (event) {
        event.preventDefault();
        $('#addmedia').modal();
    },
    'click .upload': function (event) {
        event.preventDefault();
        $('#campaign_media_file').click();
    },
    'click .select': function (event) {
        event.preventDefault();
        resetItemSearch();
        $('#addmedia').modal('hide');
    },
    'click .confirm-campaign-item': function (event) {
        event.preventDefault();
        handleItemFile($('#item_filter_url').val());
        console.log($('.filtered-results>li.ui-selected'));
        $('#campaign_media_file_url').val($('.filtered-results>li.ui-selected').attr('id'));
        $('#itemfilter').modal('hide');
    },
    'click .web-campaign-items-select': function (event) {
        event.preventDefault();
        resetItemSearch();
        $('#itemfilter').modal();
    },
    'click #btn-publish': function () {
        if ($("#campaign-create").parsley("validate")) {
            var eventDT = loadEventDateTime();
            for (var i = 0; i < eventDT.length; i++) {
                $(eventDT[i]).appendTo('#campaign-create');
            }

            $('<input />').attr('type', 'hidden')
                .attr('name', 'description')
                .attr('value', $('#desc-editor').val())
                .appendTo('#campaign-create');
            bootbox.dialog('<div class="text-center"><div class="loading-img"></div><h4>Creating campaigns...</h4></div>');
            $("#campaign-create").submit();
        }
    },
    'click #btn-schedule': function () {
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
    'click #btn-schedule-modal': function (event) {
        event.preventDefault();
        if ($("#campaign-create").parsley("validate")) {
            var eventDT = loadEventDateTime();
            for (var i = 0; i < eventDT.length; i++) {
                $(eventDT[i]).appendTo('#campaign-create');
            }
            $('<input />').attr('type', 'hidden')
                .attr('name', 'scheduled_datetime')
                .attr('value', load_scheduled_datetime())
                .appendTo('#campaign-create');

            $('.campaign-state').val('scheduled');

            $('<input />').attr('type', 'hidden')
                .attr('name', 'description')
                .attr('value', $('#desc-editor').val())
                .appendTo('#campaign-create');
            bootbox.dialog('<div class="text-center"><div class="loading-img"></div><h4>Creating campaigns...</h4></div>');
            $("#campaign-create").submit();
        }
    }
}

Template.campaign_promo_new.user_id = function () {
    return Meteor.userId();
}

Template.campaign_promo_new.brand_name = function () {
    return Session.get("selected_brand");
}

Template.campaign_promo_new.redirect_to = function () {
    return PLATFORM_URL + CAMPAIGN_CREATION_REDIRECT_TO;
}

Template.campaign_event_new.user_id = function () {
    return Meteor.userId();
}

Template.campaign_event_new.brand_name = function () {
    return Session.get("selected_brand");
}

Template.campaign_event_new.redirect_to = function () {
    return PLATFORM_URL + CAMPAIGN_CREATION_REDIRECT_TO;
}

Template.campaign_promo_new.rendered = function () {
    Meteor.subscribe("all_containers");
    Meteor.subscribe("all_items");
    $('.social-content').css('display', 'none');
    $('.web-content').css('display', 'none');
    $('#campaign_media_file').bind('change', handleMediaFile);
    $('input:checkbox').prop('checked', false);
    $('#campaign-create').parsley('destroy');
    $('#campaign-create').parsley();
    page_render(this);
}

Template.campaign_promo_new.social_types = function () {
    var brand_config = BrandConfig.findOne({name: "campaign_channel"});
    var brand_obj = BrandMappings.findOne({brand_name: Session.get("selected_brand")});
    var avail_type = [];
    if (!brand_obj) {
        return [];
    }

    for (var i = 0; i < SOCIAL_TYPE.length; i++) {
        if (brand_obj[SOCIAL_TYPE[i]]) {
            if (brand_config && !_.contains(brand_config["value"], SOCIAL_TYPE[i])) {
                //do nth
            } else {
                avail_type.push({name: SOCIAL_TYPE[i]});
            }
        }
    }
    return avail_type;
}

Template.campaign_promo_new.web_types = function () {
    var brand_config = BrandConfig.findOne({name: "campaign_channel"});
    if (!brand_config) {
        return WEB_CAMPAIGN_TYPES;
    }

    var to_ret = [];
    _.each(WEB_CAMPAIGN_TYPES, function (itm) {
        if (_.contains(brand_config.value, itm.name)) {
            to_ret.push(itm);
        }
    });
    return to_ret;
}

Template.campaign_promo_new.device_types = function () {
    var brand_config = BrandConfig.findOne({name: "campaign_channel"});
    if (!brand_config) {
        return DEVICE_CAMPAIGN_TYPES;
    }

    var to_ret = [];
    _.each(DEVICE_CAMPAIGN_TYPES, function (itm) {
        if (_.contains(brand_config.value, itm.name)) {
            to_ret.push(itm);
        }
    });
    return to_ret;
}

Template.campaign_event_new.social_types = function () {
    var brand_config = BrandConfig.findOne({name: "campaign_channel"});
    var brand_obj = BrandMappings.findOne({brand_name: Session.get("selected_brand")});
    var avail_type = [];
    if (!brand_obj) {
        return [];
    }

    for (var i = 0; i < SOCIAL_TYPE.length; i++) {
        if (brand_obj[SOCIAL_TYPE[i]]) {
            if (brand_config && !_.contains(brand_config["value"], SOCIAL_TYPE[i])) {
                //do nth
            } else {
                avail_type.push({name: SOCIAL_TYPE[i]});
            }
        }
    }
    return avail_type;
}

Template.campaign_event_new.web_types = function () {
    var brand_config = BrandConfig.findOne({name: "campaign_channel"});
    if (!brand_config) {
        return WEB_CAMPAIGN_TYPES;
    }

    var to_ret = [];
    _.each(WEB_CAMPAIGN_TYPES, function (itm) {
        if (_.contains(brand_config.value, itm.name)) {
            to_ret.push(itm);
        }
    });
    return to_ret;
}

Template.campaign_event_new.device_types = function () {
    var brand_config = BrandConfig.findOne({name: "campaign_channel"});
    if (!brand_config) {
        return DEVICE_CAMPAIGN_TYPES;
    }

    var to_ret = [];
    _.each(DEVICE_CAMPAIGN_TYPES, function (itm) {
        if (_.contains(brand_config.value, itm.name)) {
            to_ret.push(itm);
        }
    });
    return to_ret;
}

Template.campaign_promo_new.form_submit_url = function () {
    return BACKEND_URL + "campaign/data/";
}

Template.campaign_event_new.rendered = function () {
    Meteor.subscribe("all_containers");
    Meteor.subscribe("all_items");
    $('.social-content').css('display', 'none');
    $('.web-content').css('display', 'none');
    $('#campaign_media_file').bind('change', handleMediaFile);
    $('input:checkbox').prop('checked', false);
    $('#campaign-create').parsley('destroy');
    $('#campaign-create').parsley();
    page_render(this);
}

Template.campaign_event_new.form_submit_url = function () {
    return BACKEND_URL + "campaign/data/";
}

Template.campaign_list.rendered = function () {
    $('.selection input:checkbox').change(function () {
        var selected = $('.selection input:checkbox:checked').length;
        var total = $('.selection input:checkbox').length;
        if (selected > 0) {
            $('.selected-buttons').css('display', 'block');
        } else {
            $('.selected-buttons').css('display', 'none');
        }

        if (selected === total) {
            $('#select-all').html('<i class="icon-ok"></i> Unselect All');
        }
        else {
            $('#select-all').html('<i class="icon-ok"></i> Select All');
        }
    })
}

Template.campaign_list.events = {
    'click .page-back': function () {
        var page = Session.get("campaign_list_page");
        if (page == 1) {
            return;
        }
        else {
            Session.set("campaign_list_page", (page - 1));
        }
    },
    'click .page-next': function () {
        var page = Session.get("campaign_list_page");
        var total = Template.campaign_list.total();
        if (page >= (total / 10)) {
            return;
        }
        else {
            Session.set("campaign_list_page", (page + 1));
        }
    },
    'click #select-all': function (event) {
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
    'click .expand-all': function (event) {
        $('.collapse').collapse('show');
        $('.expand-all').html('<i class="icon-arrow-down"></i> Collapse All');
        $(event.currentTarget).addClass('collapse-all').removeClass('expand-all');
    },
    'click .collapse-all': function (event) {
        $('.collapse').collapse('hide');
        $('.collapse-all').html('<i class="icon-arrow-down"></i> Expand All');
        $(event.currentTarget).addClass('expand-all').removeClass('collapse-all');
    },
    'click .expanded-edit': function (event) {
        var campaign_id = $(event.currentTarget).find('.edit-campaign-id').val();
        var campaign_type = $(event.currentTarget).find('.edit-campaign-type').val();
        Session.set('edit_campaign_type', campaign_type);
        Session.set('edit_campaign_id', campaign_id);
        $('#edit_campaign_modal').modal();
        $('#edit_campaign_modal').on('hidden', function () {
            Session.set('edit_campaign_type', '');
            Session.set('edit_campaign_id', '');
        });
    },
    'click .delete-campaign': function (event) {
        var checked = $('.selection input:checkbox:checked');
        var campaign_list = [];
        for (var i = 0; i < checked.length; i++) {
            campaign_list.push($(checked[i]).val());
        }

        Meteor.call('http_api', 'del', 'campaign/?user_id=' + Meteor.userId() +
            "&brand_name=" + Session.get("selected_brand") +
            "&campaign_list=" + campaign_list,
            function (error, result) {
                if (result.statusCode !== 200) {
                    console.log(result.error);
                }
            });
    },
    'click #btn-edit-modal': function (event) {
        event.preventDefault();
        console.log('loaded');
        var args = {};

        Meteor.call('http_api', 'put', 'campaign/data/update/', load_edited_content(args), function (error, result) {
            $('#edit_campaign_modal').modal('hide');
            if (result.statusCode !== 200) {
                console.log(result.error);
            }
        })
    }
}

Template.campaign_list.total = function () {
    return Mappings.find().count();
}

Template.campaign_list.list_page = function () {
    Session.setDefault("campaign_list_page", 1);
    return Session.get("campaign_list_page");
}

Template.campaign_list.campaigns = function () {
    var offset = (Session.get("campaign_list_page") * 10) - 10;
    var mappings = Mappings.find({}, {limit: 10, skip: offset, sort: {timestamp_utc: -1}}).fetch();
    _CampaignsList.remove({});
    for (var i = 0; i < mappings.length; i++) {
        _CampaignsList.insert(computeCampaign(mappings[i]));
    }

    return _CampaignsList.find({}).fetch();
}

Template.campaign_list.edit_campaign = function () {
    Session.setDefault('edit_campaign_type', 'promotion');
    Session.get('edit_campaign_id');
    var edit_type = Session.get('edit_campaign_type');
    if (edit_type === 'promotion') {
        return Template["campaign_promo"]();
    }
    else {
        return Template["campaign_event"]();
    }
}

Template.campaign_promo.rendered = function () {
    input_change('#campaign-title', '.char-count');
    $('#desc-editor').wysihtml5();
    var li = document.createElement('li')
    $(li).html('<a class="btn web-campaign-items-select" href="#" title="Get Item Link" unselectable="on"><i class="icon-folder-open"></i></a>');
    $('.wysihtml5-toolbar').append(li);

    var id = Session.get('edit_campaign_id');
    if (id) {
        loadCampaignData(id)
    }
}

Template.campaign_event.rendered = function () {
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
    var li = document.createElement('li')
    $(li).html('<a class="btn web-campaign-items-select" href="#" title="Get Item Link" unselectable="on"><i class="icon-folder-open"></i></a>');
    $('.wysihtml5-toolbar').append(li);

    var id = Session.get('edit_campaign_id');
    if (id) {
        campaign = loadCampaignData(id);
        var datepicker = $('#event-date').data('datetimepicker');
        var start_timepicker = $('#event-time-start').data('datetimepicker');
        var end_timepicker = $('#event-time-end').data('datetimepicker');
        var start = new Date(campaign["obj_start"]);
        var end = campaign["obj_end"] ? new Date(campaign["obj_end"]) : "";
        datepicker.setDate(start);
        start_timepicker.setDate(start)
        end ? end_timepicker.setDate(end) : "";
    }
}

Template.campaign_select_item.rendered = function () {
    filter_item_results();
    $('.filtered-results').selectable({
        selected: function (event, ui) {
            $('#item_filter_url').val('Loading...');
            Meteor.call('http_api', 'get', 'campaign/item/url/', {"obj_id": ui.selected.id}, function (error, result) {
                if (result.statusCode !== 200) {
                    console.log(result.error);
                    $('#item_filter_url').val('Fail to get item link.');
                }
                $('#item_filter_url').val(result.data.url);
            })
        }
    });
}

Template.campaign_select_item.events = {
    'keyup #item_filter_kw': function () {
        filter_item_results();
    }
}

function filter_item_results() {
    var val = $('#item_filter_kw').val();
    var items;
    if (val.length == 0) {
        items = ITMItems.find({media_id: {$ne: null}}, {limit: 5}).fetch();
    }
    else {
        items = ITMItems.find({name: {$regex: ".*" + $('#item_filter_kw').val() + ".*"}, media_id: {$ne: null}}, {limit: 5}).fetch();
    }
    $('.filtered-results').empty();
    for (var i = 0; i < items.length; i++) {
        var item_path = items[i].name;
        if (items[i].container_id) {
            var container = ITMChildCategories.findOne({_id: items[i].container_id});
            if (!container) {
                return;
            }
            item_path = container.name.concat(" / " + item_path)
        }

        var li = document.createElement('li');
        $(li).text(item_path);
        $(li).attr('id', items[i]._id._str);
        $('.filtered-results').append(li);
    }
}

function handleMediaFile() {
    var fileList = this.files;
    $('#addmedia').modal('hide');
    if (fileList.length > 0) {
        $('.add-media').empty();
        var file = fileList[0];
        var img = document.createElement("img");
        $(img).addClass("add-media-thumbnail");
        $(img).addClass("img-polaroid");
        $(img).addClass("pull-left")
        img.file = file;
        $('.add-media').prepend(img);
        var reader = new FileReader();
        reader.onload = (function (aImg) {
            return function (e) {
                aImg.src = e.target.result;
            };
        })(img);
        reader.readAsDataURL(file);
        var changeMedia = $('.add-media').children()[1];
        var changeDiv = document.createElement("div");
        $(changeDiv).addClass("img-polaroid");
        $(changeDiv).addClass("change-media-thumbnail");
        $(changeDiv).addClass("pull-left");
        $(changeDiv).text("Change Photo");
        var changeA = document.createElement("a");
        $(changeA).addClass("add-media-modal");
        $(changeA).append(changeDiv);
        $('.add-media').append(changeA);
        $('.add-media').append('<div class="clear"></div>')
    }
}

function handleItemFile(item_url) {
    $('.add-media').empty();
    var img = document.createElement("img");
    $(img).addClass("add-media-thumbnail");
    $(img).addClass("img-polaroid");
    $(img).addClass("pull-left");
    $(img).attr('src', item_url);
    $('.add-media').prepend(img);

    var changeMedia = $('.add-media').children()[1];
    var changeDiv = document.createElement("div");
    $(changeDiv).addClass("img-polaroid");
    $(changeDiv).addClass("change-media-thumbnail");
    $(changeDiv).addClass("pull-left");
    $(changeDiv).text("Change Photo");
    var changeA = document.createElement("a");
    $(changeA).addClass("add-media-modal");
    $(changeA).append(changeDiv);
    $('.add-media').append(changeA);
    $('.add-media').append('<div class="clear"></div>')
}

function loadCampaignData(id) {
    var campaign = _CampaignsList.findOne({id: id});
    if (!campaign) {
        return
    }
    ;
    campaign.obj_title ? $('textarea#campaign-title').val(campaign.obj_title) : "";
    $('.char-count').text(campaign.obj_title.length + " characters")
    $('#desc-editor').val(campaign.obj_desc);

    return campaign;
}

function computeCampaign(mapping) {
    var dict = {id: "", type: "", platforms: "", title: "", obj_title: "", obj_desc: "", state: "", created: "", scheduled: "", expanded: "" };
    var time_now = new Date().getTime();

    dict["id"] = mapping._id.toHexString();
    dict["type"] = mapping.type;

    for (var i = 0; i < platforms.length; i++) {
        if (mapping[platforms[i]]) {
            if (mapping[platforms[i]] == 1 && platforms[i] === "push") {
                dict["platforms"] += '<div class="type-ios pull-left"></div><div class="type-android pull-left"></div>'
                continue;
            }
            dict["platforms"] += '<div class="type-' + platforms[i] + ' pull-left"></div>';
        }
    }

    // web/mobile campaign
    if (mapping.campaign) {
        var campaign = Campaigns.findOne({_id: mapping.campaign});
        dict["title"] = campaign ? wrapTitleContainer(wrapBold(campaign.title) + " - " + wrapGray(stripHTML(campaign.description))) : "";
        dict["obj_title"] = value_check(campaign, "title");
        dict["obj_desc"] = value_check(campaign, "description");
        dict["obj_start"] = value_check(campaign, "happening_datetime_start") ? new Date(0).setUTCSeconds(value_check(campaign, "happening_datetime_start")) : undefined;
        dict["obj_end"] = value_check(campaign, "happening_datetime_end") ? new Date(0).setUTCSeconds(value_check(campaign, "happening_datetime_end")) : undefined;
    }
    // web/mobile blog
    else if (mapping.blog) {
        var campaign = ITMItems.findOne({_id: mapping.blog});
        dict["title"] = campaign ? wrapTitleContainer(wrapBold(campaign.name) + " - " + wrapGray(stripHTML(campaign.description))) : "";
        dict["obj_title"] = value_check(campaign, "name");
        dict["obj_desc"] = value_check(campaign, "description");
        dict["obj_start"] = value_check(campaign, "happening_datetime_start") ? new Date(0).setUTCSeconds(value_check(campaign, "happening_datetime_start")) : undefined;
        dict["obj_end"] = value_check(campaign, "happening_datetime_end") ? new Date(0).setUTCSeconds(value_check(campaign, "happening_datetime_end")) : undefined;
    }
    // facebook event
    else if (mapping.facebook && mapping.type === "event") {
        var fb = FBEvents.findOne({_id: mapping.facebook});
        dict["title"] = fb ? wrapTitleContainer(wrapBold(fb.fields.name) + " - " + wrapGray(stripHTML(fb.fields.description))) : "";
        dict["obj_title"] = fb ? fb.fields.name : "";
        dict["obj_desc"] = fb ? convertNewLine(fb.fields.description) : "";
        dict["obj_start"] = fb ? fb.fields.start_time : "";
        dict["obj_end"] = fb ? fb.fields.end_time : "";
        // facebook status/link/photo
    } else if (mapping.facebook && mapping.type === "promotion") {
        var fb = FBPosts.findOne({_id: mapping.facebook});
        dict["title"] = fb ? wrapTitleContainer(wrapBold(fb_load_message(fb))) : "";
        dict["obj_title"] = fb ? fb_load_message(fb) : "";
        // twitter tweet
    } else if (mapping.twitter) {
        var tw = TWTweets.findOne({_id: mapping.twitter});
        dict["title"] = tw ? wrapTitleContainer(wrapBold(tw.fields.text)) : "";
        dict["obj_title"] = tw ? tw.fields.text : "";
        // foursquare page update
    } else if (mapping.foursquare) {
        var fsq = FSQPageUpdates.findOne({_id: mapping.foursquare});
        dict["title"] = fsq ? wrapTitleContainer(wrapBold(fsq.fields.shout)) : "";
        dict["obj_title"] = fsq ? fsq.fields.shout : "";
    }

    dict["state"] = mapping.state === "published" ? "<i class='icon-ok-sign'></i>" : "<i class='icon-time'></i>"
    dict["created"] = timeDifference(time_now, new Date(mapping.timestamp_utc).getTime());
    dict["expanded"] = loadCampaignCard(mapping, dict);

    return dict;
}

function fb_load_message(fb) {
    if (fb.fields.message) {
        return fb.fields.message;
    } else {
        return fb.fields.name;
    }
}

function value_check(obj, attr) {
    if (obj) {
        return obj[attr] ? obj[attr] : undefined;
    }
    else return undefined;
}

function loadCampaignCard(mapping, dict) {
    var card = '';
    var title = dict["obj_title"];
    var desc = dict["obj_desc"];

    card += '<div class="expanded-title">' + title + '</div>';
    var startDate = new Date(dict["obj_start"]);
    var endDate = new Date(dict["obj_end"]);
    if (dict["obj_start"]) {
        card += '<div class="expanded-event-datetime"><i class="icon-calendar"></i> ' + startDate.toDateString() + '<span class="expanded-event-start"><i class="icon-time"></i> ' + startDate.toLocaleTimeString();
    }
    if (dict["obj_end"]) {
        card += ' until ' + endDate.toLocaleTimeString();
    }
    if (dict["obj_start"]) {
        card += '</span></div>';
    }
    card += desc ? '<div class="expanded-desc">' + desc + '</div>' : '';
    card += '<hr>';

    var ts = new Date(mapping.timestamp_utc);
    var scheduled = new Date(mapping.publish_datetime);
    card += '<div class="expanded-edit pull-left"><i class="icon-edit"></i>' +
        '<input type="hidden" class="edit-campaign-type" value="' + dict["type"] + '">' +
        '<input type="hidden" class="edit-campaign-id" value="' + dict["id"] + '"> Edit campaign</div>';
    card += mapping.state === "published" ?
        '<span class="expanded-datetime pull-left">Published on ' + ts.toDateString() + ' ' + ts.toLocaleTimeString() + '</span>' :
        '<span class="expanded-datetime pull-left">Scheduled for ' + scheduled.toDateString() + ' ' + scheduled.toLocaleTimeString() + '</span>';
    card += '<div class="clear"></div>';

    return card;
}

function convertNewLine(val) {
    if (val) {
        return val.replace(/\n/g, '<br>');
    }
    else {
        return "";
    }
}

function wrapTitleContainer(val) {
    return "<div class='title-shorten pull-left'>" + val + "</div>";
}

function wrapBold(val) {
    return "<span class='title-bold'>" + val + "</span>";
}

function wrapGray(val) {
    return "<span class='title-gray'>" + val + "</span>";
}

function stripHTML(val) {
    if (val) {
        val = val.replace(/\<br\>/g, " ");
        return val.replace(/<(?:.|\n)*?>/gm, '');
    } else {
        return "";
    }
}

function input_change(id, display_div) {
    $(id).bind('input propertychange', function () {
        $(display_div).text(this.value.length + " characters")
    })
}

function load_content(args, type, state) {
    var selected_platforms = $('.platform').find(":checkbox:checked");
    var platforms = "";
    for (var i = 0; i < selected_platforms.length; i++) {
        platforms += selected_platforms[i].value + ",";
    }

    args["user_id"] = Meteor.userId();
    args["brand_name"] = Session.get("selected_brand");
    args["platform"] = platforms.substr(0, platforms.length - 1);
    args["type"] = type;
    args["title"] = $('#campaign-title').val();
    args["description"] = $('#desc-editor').val();
    args["state"] = state;

    if ($('.campaign-post-datetime') != undefined) {
        var date = $('.campaign-post-date-input').val();
        var time_start = $('.campaign-post-time-from-input').val();
        var time_end = $('.campaign-post-time-to-input').val();
        if (time_start) {
            var epoch_start = new Date(date + " " + time_start).getTime() / 1000;
            args["datetime_start"] = epoch_start;
        }
        if (time_end) {
            var epoch_end = new Date(date + " " + time_end).getTime() / 1000;
            args["datetime_end"] = epoch_end;
        }
    }

    return args;
}

function loadEventDateTime() {
    var eventInput = [];
    if ($('.campaign-post-datetime') != undefined) {
        var date = $('.campaign-post-date-input').val();
        var time_start = $('.campaign-post-time-from-input').val();
        var time_end = $('.campaign-post-time-to-input').val();
        if (time_start) {
            var epoch_start = new Date(date + " " + time_start).getTime() / 1000;
            eventInput[0] = $('<input />').attr('type', 'hidden')
                .attr('name', 'datetime_start')
                .attr('value', epoch_start);
        }
        if (time_end) {
            var epoch_end = new Date(date + " " + time_end).getTime() / 1000;
            eventInput[1] = $('<input />').attr('type', 'hidden')
                .attr('name', 'datetime_end')
                .attr('value', epoch_end);
        }
    }

    return eventInput;
}

function load_edited_content(args) {
    args["user_id"] = Meteor.userId();
    args["brand_name"] = Session.get("selected_brand");
    args["campaign_id"] = Session.get('edit_campaign_id');
    args["title"] = $('#campaign-title').val();
    args["description"] = $('#desc-editor').val();
    if ($('.campaign-post-datetime') != undefined) {
        var date = $('.campaign-post-date-input').val();
        var time_start = $('.campaign-post-time-from-input').val();
        var time_end = $('.campaign-post-time-to-input').val();
        if (time_start) {
            var epoch_start = new Date(date + " " + time_start).getTime() / 1000;
            args["datetime_start"] = epoch_start;
        }
        if (time_end) {
            var epoch_end = new Date(date + " " + time_end).getTime() / 1000;
            args["datetime_end"] = epoch_end;
        }
    }
    return args;
}


function load_scheduled_datetime() {
    var date = $('.campaign-post-date-input-schedule').val();
    var time = $('.campaign-post-time-from-input-schedule').val();
    var epoch = new Date(date + " " + time).getTime() / 1000;
    return epoch;
}

function resetItemSearch() {
    $('#item_filter_url').val('No item selected.');
    $('.filtered-results').empty();
    $('#item_filter_kw').val('');
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
        return Math.round(elapsed / 1000) + ' seconds ago';
    }
    else if (elapsed < msPerHour) {
        return Math.round(elapsed / msPerMinute) + ' minutes ago';
    }
    else if (elapsed < msPerDay) {
        return Math.round(elapsed / msPerHour) + ' hours ago';
    }
    /*else if (elapsed < msPerMonth) {
     return Math.round(elapsed/msPerDay) + ' days ago';
     }*/
    else {
        var d = new Date(previous);
        return format ? d.toDateString() + " " + d.toLocaleTimeString() : d.toDateString();
    }
}