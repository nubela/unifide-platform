var twitter_default_template = "twitter_activity"

Template.twitter.view = function() {
    var parse = Session.get("page_template").split("_");
    if (parse.length > 1) {
        return Template[Session.get("page_template")]();
    }

    return Template[twitter_default_template]();
}

Template.twitter_activity.activity_list = function() {
    _TWActivity.remove({});
    var client_TWTweets = TWTweets.find({}, {limit: 10}).fetch();
    for (var i = 0; i < client_TWTweets.length; i++) {
        _TWActivity.insert(client_TWTweets[i]);
    }

    return _TWActivity.find();
};