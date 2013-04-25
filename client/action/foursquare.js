var foursquare_default_template = "foursquare_venue_activity"

Template.foursquare.view = function() {
    var parse = Session.get("page_template").split("_");
    if (parse.length > 1) {
        return Template[Session.get("page_template")]();
    }

    return Template[foursquare_default_template]();
}

Template.foursquare_venue_activity.activity_list = function() {
    _FSQActivity.remove({});
    var client_FSQTips = FSQTips.find({}, {limit: 4}).fetch();
    for (var i=0; i < client_FSQTips.length;i++) {
        _FSQActivity.insert(client_FSQTips[i]);
    }

    return _FSQActivity.find();
};