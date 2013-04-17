var campaign_default_template = "campaign_list";

Template.campaign.view = function() {
    var parse = Session.get("page_template").split("_");
    if (parse.length > 1) {
        return Template[Session.get("page_template")]();
    }

    return Template[campaign_default_template]();
}

Template.campaign.all_campaigns_count = function() {
    return Mappings.find().count();
}

Template.campaign_list.rendered = function() {
    $('.campaign-nav-submenu li').removeClass("active");
    $('a[href$="/campaign"]').parent().addClass("active");
}

Template.campaign_list.campaigns_list = function() {
    _CampaignListing.remove({});
    var client_mappings = Mappings.find().fetch();
    for (var i=0;i<client_mappings.length;i++) {
        var client_campaign = Campaigns.findOne({_id: {$exists: true, $in: client_mappings[i].campaign_list}});
        console.log(client_mappings[i].campaign_list);
        console.log(client_campaign);
        _CampaignListing.insert({campaign: client_campaign});

        if (_CampaignListing.find({}, {reactive: false}).count() == 5) { break; }
    }

    return _CampaignListing.find();
}

Template.campaign_new_promo.rendered = function() {
    $('.campaign-nav-submenu li').removeClass("active");
    $('a[href$="/campaign/new/promo"]').parent().addClass("active");
}

Template.campaign_new_event.rendered = function() {
    $('.campaign-nav-submenu li').removeClass("active");
    $('a[href$="/campaign/new/event"]').parent().addClass("active");
}