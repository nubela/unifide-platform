var twitter_default_template = "twitter_activity"

Template.twitter.view = function() {
    var parse = Session.get("page_template").split("_");
    if (parse.length > 1) {
        return Template[Session.get("page_template")]();
    }

    return Template[twitter_default_template]();
}

Template.twitter_activity.events = {
    'click .page-back': function() {
        var page = Session.get("twitter_activity_page");
        if (page == 1) { return; }
        else { Session.set("twitter_activity_page", (page-1)); }
    },
    'click .page-next': function() {
        var page = Session.get("twitter_activity_page");
        var total = Template.twitter_activity.total();
        if (page >= (total/10)) { return; }
        else { Session.set("twitter_activity_page", (page+1)); }
    },
    'click .twitter-reply': function(event) {
        event.preventDefault();
        var screen_name = $(event.currentTarget).parent().find('.tweet_screen_name').val();
        var tweet_id = $(event.currentTarget).parent().find('.tweet_id').val()
        $('#twitter-reply-modal').find('.modal-header').find('h5').text("Reply to @" + screen_name);
        $('#twitter-reply-modal').find('.tweet_id').val(tweet_id);
        $('#twitter-reply-modal').find('textarea').val("@" + screen_name + " ");
        $('#twitter-reply-modal').modal();
    },
    'click .twitter-tweet-reply': function(event) {
        event.preventDefault();
        var args = {
            "user_id": Meteor.userId(),
            "brand_name": Session.get("selected_brand"),
            "in_reply_to": $('#twitter-reply-modal').find('.tweet_id').val(),
            "text": $('#twitter-reply-modal').find('textarea').val()
        }
        Meteor.call('http_api', 'put', 'social_connect/twitter/tweet/', args, function(error, result) {
            $('#twitter-reply-modal').modal('hide');
            if (result.statusCode !== 200) { console.log(result.error); }
        })
    }
}

Template.twitter_activity.check_twitter = function() {
    var brand_obj = detect_selected_brand(Session.get("selected_brand"), "twitter");
    if (!brand_obj) { return false; }
    if (!brand_obj.id && TWTweets.find().count() > 0) { return false; }
    return true;
}

Template.twitter_activity.total = function() {
    _TWActivity.remove({}, {reactive: false});
    var time_now = new Date().getTime();
    var tw_tweets = TWTweets.find({}).fetch();
    for (var i = 0; i < tw_tweets.length; i++) {
        var tweet = tw_tweets[i]
        tweet["datetime"] = timeDifference(time_now, new Date(tweet.created_at).getTime());
        tweet["parsed_text"] = tw_message_template(tweet);
        _TWActivity.insert(tweet, {reactive: false});
    }

    return _TWActivity.find().count();
}

Template.twitter_activity.activity_page = function() {
    Session.setDefault("twitter_activity_page", 1);
    return Session.get("twitter_activity_page");
}

Template.twitter_activity.activity_list = function() {
    var offset = (Session.get("twitter_activity_page") * 10) - 10;
    return _TWActivity.find({}, {limit: 10, skip: offset}).fetch();
};

function detect_selected_brand(brand, platform) {
    if (BrandMappings.findOne({uid: Meteor.userId(), brand_name: brand}) == undefined) { return null; }
    var brand_obj = (BrandMappings.findOne({uid: Meteor.userId(), brand_name: brand}))[platform];
    if (brand_obj == undefined) { return null }
    return brand_obj;
}

function tw_message_template(tweet) {
    var parsed_text = "";
    var last_indice = 0;
    for (var i=0;i<tweet.fields.entities.urls.length;i++) {
        var entity_url = tweet.fields.entities.urls[i];
        parsed_text += tweet.fields.text.substring(last_indice,entity_url.indices[0])
        parsed_text += "<a class='tweet-links' " +
                        "onclick='window.open(this.href,'_blank');return false;' " +
                        "href='" + entity_url.expanded_url + "'>" + entity_url.expanded_url + "</a>"
        last_indice = entity_url.indices[1];
    }
    parsed_text += tweet.fields.text.substring(last_indice);
    return parsed_text;
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