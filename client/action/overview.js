Template.overview_facebook.check_facebook = function() {
    var brand_obj = detect_selected_brand(Session.get("selected_brand"), "facebook");
    if (!brand_obj) { return false; }
    if (!brand_obj.id && FBPosts.find().count() > 0) { return false; }
    return true;
}

Template.overview_facebook.facebook_overview = function() {
    var selected_brand = Session.get("selected_brand");
    var brand_obj = detect_selected_brand(selected_brand, "facebook");
    if (!brand_obj) { return []; }
    var page_id = brand_obj.id;

    _FBOverview.remove({}, {reactive: false});
    var fb_posts = FBPosts.find({post_id: {$ne: null}}, {sort: {updated_time: -1}}).fetch();
    for (var i=0;i<fb_posts.length;i++) {
        var post = fb_posts[i];
        var post_comments = FBComments.find({post_id: post.post_id}, {sort: {created_time: -1}}).fetch();
        var next_post = (i+1) < fb_posts.length ? fb_posts[i+1] : null;

        if (post_comments.length == 0) {
            if (post.fields.story) { _FBOverview.insert(fb_message_template(post, "story")); }
            else { _FBOverview.insert(fb_message_template(post, "post")); }
        }

        for (var x=0;x<post_comments.length;x++) {
            var comment = post_comments[x];
            if (comment.owner.id == page_id) { continue; }
            if (next_post) {
                if (comment.created_time > next_post.updated_time) {
                    _FBOverview.insert(fb_message_template(comment, "comment", {type: post.fields.type, actions: post.fields.actions}));
                }
            }
            else { _FBOverview.insert(fb_message_template(comment, "comment", {type: post.fields.type, actions: post.fields.actions})); }

            if (_FBOverview.find({}, {reactive: false}).count() == 5) { break; }
        }

        if (_FBOverview.find({}, {reactive: false}).count() == 5) { break; }
    }

    return _FBOverview.find({}, {reactive: false}).fetch();
};

Template.overview_twitter.events = {
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

Template.overview_twitter.check_twitter = function() {
    var brand_obj = detect_selected_brand(Session.get("selected_brand"), "twitter");
    if (!brand_obj) { return false; }
    if (!brand_obj.id && TWTweets.find().count() > 0) { return false; }
    return true;
}

Template.overview_twitter.twitter_overview = function() {
    _TWOverview.remove({}, {reactive: false});
    var time_now = new Date().getTime();
    var tw_tweets = TWTweets.find({}, {limit: 5}).fetch();
    for (var i = 0; i < tw_tweets.length; i++) {
        var tweet = tw_tweets[i]
        tweet["datetime"] = timeDifference(time_now, new Date(tweet.created_at).getTime());
        tweet["parsed_text"] = tw_message_template(tweet);
        _TWOverview.insert(tweet, {reactive: false});
    }

    return _TWOverview.find({}, {reactive: false}).fetch();
};

Template.overview_foursquare.foursquare_overview = function() {
    _FSQOverview.remove({});
    var client_FSQTips = FSQTips.find({}, {limit: 4}).fetch();
    for (var i=0; i < client_FSQTips.length;i++) {
        _FSQOverview.insert(client_FSQTips[i]);
    }

    return _FSQOverview.find().fetch();
}

Template.overview_brandmention.web_mentions_overview = function() {
    return BrandMentions.find({}, {sort: {modification_timestamp_utc: -1}, limit: 4}).fetch();
}

Template.overview_web.check_web = function() {
    if (Campaigns.find().count() == 0) { return false; }
    return true;
}

Template.overview_web.web_overview = function() {
    var time_now = new Date().getTime();
    _WebOverview.remove({});

    var mappings = Mappings.find({$or: [{campaign: {$ne: null}}, {blog: {$ne: null}}], state: "published"}, {limit: 5}).fetch();
    console.log(mappings.length);
    for (var i=0;i<mappings.length;i++) {
        var m = mappings[i];
        var content = getContentCampaign(m);
        _WebOverview.insert({platforms: loadPlatforms(m),
                            event: loadEventDetails(content),
                            title: content.title,
                            description: stripHTML(content.description),
                            datetime: timeDifference(time_now, new Date(m.timestamp_utc))});
    }

    return _WebOverview.find().fetch();
};

function getContentCampaign(mapping) {
    var objId = mapping.campaign ? mapping.campaign : mapping.blog;
    return Campaigns.findOne({_id: objId});
}

function loadEventDetails(content) {
    var val = "";
    var event_start = value_check(content, "happening_datetime_start");
    var event_end = value_check(content, "happening_datetime_end");
    console.log(content);

    if (event_start) {
        var startDate = getTimeFromUTC(event_start);
        console.log(startDate);
        val += '<div class="expanded-event-datetime"><i class="icon-calendar"></i> ' + startDate.toDateString() + '<span class="expanded-event-start"><i class="icon-time"></i> ' + startDate.toLocaleTimeString();
    }
    if (event_end) { var endDate = getTimeFromUTC(event_end); val += ' until ' + endDate.toLocaleTimeString(); }
    if (event_start) { val += '</span></div>'; }

    return val;
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

function stripHTML(val) {
    val = val.replace(/\<br\>/g," ");
    return val.replace(/<(?:.|\n)*?>/gm, '');
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

function detect_selected_brand(brand, platform) {
    if (BrandMappings.findOne({uid: Meteor.userId(), brand_name: brand}) == undefined) { return null; }
    var brand_obj = (BrandMappings.findOne({uid: Meteor.userId(), brand_name: brand}))[platform];
    if (brand_obj == undefined) { return null }
    return brand_obj;
}

function fb_message_template(status, status_type, args) {
    var time_now = new Date().getTime();
    if (status_type == "post") {
        return {
            name: status.owner.name,
            uid: status.owner.id,
            message: " posted on your timeline: \"" + status.fields.message + "\"",
            link: (_.find(status.fields.actions, function(obj) { return obj.name == "Comment"})).link,
            datetime: timeDifference(time_now, new Date(status.updated_time).getTime()),
            type: status_type
        }
    } else if (status_type == "comment") {
        return {
            name: status.owner.name,
            uid: status.owner.id,
            message: " commented on your " + args.type + ": \"" + status.message + "\"",
            link: (_.find(args.actions, function(obj) { return obj.name == "Comment"})).link,
            datetime: timeDifference(time_now, new Date(status.created_time).getTime()),
            type: status_type
        }
    } else if (status_type == "story") {
        var offset = status.fields;
        return {
            name: status.fields.from.name,
            uid: status.fields.from.id,
            message: status.fields.story.substring(status.fields.from.name.length),
            link: status.fields.link ? status.fields.link : "http://facebook.com/" + status.fields.from.id,
            datetime: timeDifference(time_now, new Date(status.fields.updated_time).getTime()),
            type: "link"
        }
    }
}

function tw_message_template(tweet) {
    var parsed_text = "";
    var last_indice = 0;
    for (var i=0;i<tweet.fields.entities.urls.length;i++) {
        var entity_url = tweet.fields.entities.urls[i];
        parsed_text += tweet.fields.text.substring(last_indice,entity_url.indices[0])
        parsed_text += "<a class='tweet-links' " +
                        "onclick='window.open(this.href,'_blank');return false;' " +
                        "href='" + entity_url.expanded_url + "'>" + entity_url.display_url + "</a>"
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