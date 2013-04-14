var campaign_default_template = "campaign_list";

Template.campaign.view = function() {
    var parse = Session.get("page_template").split("_");
    if (parse.length > 1) {
        return Template[Session.get("page_template")]();
    }

    return Template[campaign_default_template]();
}

Template.campaign_list.rendered = function() {
    $('.campaign-nav-submenu li').removeClass("active");
    $('a[href$="/campaign"]').parent().addClass("active");
}

Template.campaign_new_promo.rendered = function() {
    $('.campaign-nav-submenu li').removeClass("active");
    $('a[href$="/campaign/new/promo"]').parent().addClass("active");
}

Template.campaign_new_event.rendered = function() {
    $('.campaign-nav-submenu li').removeClass("active");
    $('a[href$="/campaign/new/event"]').parent().addClass("active");
}