Template.overview.facebook_overview = function () {
    _FBOverview.remove({});
    var client_FBPosts = FBPosts.find().fetch();
    for (var i = 0; i < client_FBPosts.length; i++) {
        var client_FBComments = FBComments.find({post_id: client_FBPosts[i].post_id}).fetch();
        if (client_FBComments.length == 0) {
            continue;
        } // no comments/conversations, skip post
        for (var x = 0; x < client_FBComments.length; x++) {
            if (i + 1 < client_FBPosts.length) {
                if (client_FBComments[x].created_time > client_FBPosts[i + 1].updated_time) {
                    var user_name = (_FBUsers.findOne({id: client_FBComments[x].user}) != undefined) ? _FBUsers.findOne({id: client_FBComments[x].user}).name : ""
                    _FBOverview.insert({post: client_FBPosts[i], comment: client_FBComments[x], username: user_name});
                }
            } else {
                var user_name = (_FBUsers.findOne({id: client_FBComments[x].user}) != undefined) ? _FBUsers.findOne({id: client_FBComments[x].user}).name : ""
                _FBOverview.insert({post: client_FBPosts[i], comment: client_FBComments[x], username: user_name});
            }

            if (_FBOverview.find({}, {reactive: false}).count() == 5) {
                break;
            }
        }
        if (_FBOverview.find({}, {reactive: false}).count() == 5) {
            break;
        }
    }

    return _FBOverview.find();
};


Template.overview.twitter_overview = function () {
    _TWOverview.remove({});
    var client_TWTweets = TWTweets.find({}, {sort: {created_at: -1}}).fetch();
    for (var i = 0; i < client_TWTweets.length; i++) {
        if (_TWOverview.find({}, {reactive: false}).count() == 0) {
            _TWOverview.insert({tweet: client_TWTweets[i], tweeter: _TWUsers.findOne({tw_id: client_TWTweets[i].user})});
            continue;
        }
        if (client_TWTweets[i].created_at < client_TWTweets[i - 1].created_at) {
            _TWOverview.insert({tweet: client_TWTweets[i], tweeter: _TWUsers.findOne({tw_id: client_TWTweets[i].user})});
        }
        if (_TWOverview.find({}, {reactive: false}).count() == 4) {
            break;
        }
    }

    return _TWOverview.find();
};


Template.overview.web_mentions_overview = function () {
    return BrandMentions.find({}, {sort: {modification_timestamp_utc: -1}, limit: 4});
}