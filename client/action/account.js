/*
    Session variables list

    - selected_brand (currently selected brand globally)
    - account_brand (the selected brand to view account settings)

 */

Template.account.created = function() {
    if (BrandMappings.findOne({brand_name: Session.get("account_brand")}) == undefined) {
        Session.set("account_brand", Session.get("selected_brand"));
        Router.navigate("/account/"+Session.get("selected_brand"), {replace: true});
    }
}

Template.account.brands = function() {
    return BrandMappings.find();
}

Template.account.view = function() {
    return Template["account_brand"]();
}

Template.account_brand.rendered = function() {
    page_render(this);
}

Template.account_brand.brand = function() {
    return Session.get("account_brand");
}

var no_account_added = "No account added";

Template.account_brand.facebook_account = function() {
    var curr_brand = Session.get("account_brand");
    var brand_mapping_obj = BrandMappings.findOne({brand_name: curr_brand});
    if (brand_mapping_obj == undefined) { return no_account_added; }
    if (brand_mapping_obj.facebook == undefined) { return no_account_added; }

    return brand_mapping_obj.facebook.page_id;
}

Template.account_brand.twitter_account = function() {
    return no_account_added;
}

Template.account_brand.foursquare_account = function() {
    return no_account_added;
}

Template.profile.rendered = function() {
    page_render(this);
}

Template.profile.brands = function() {
    return BrandMappings.find();
}

Template.profile.view = function() {
    return Template["profile_update"]();
}

function page_render(obj) {
    $(obj.firstNode).css({'opacity': 0});
    $(obj.firstNode).css({'position': 'relative', 'left': 100});
    $(obj.firstNode).animate({'opacity': 1, 'left': '-=100'}, 100);
}