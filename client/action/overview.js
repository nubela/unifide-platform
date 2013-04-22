<<<<<<< HEAD
Template.overview_facebook.facebook_overview = function() {
    if (BrandMappings.findOne({uid: Meteor.userId(), brand_name: Session.get("selected_brand")}) == undefined) { return []; }
    var brand_obj = (BrandMappings.findOne({uid: Meteor.userId(), brand_name: Session.get("selected_brand")})).facebook;
    if (brand_obj == undefined) { return [] }
    var page_id = brand_obj.id;

    _FBOverview.remove({});
    var client_FBPosts = FBPosts.find({}, {sort: {updated_time: -1}}).fetch();
    for (var i=0;i<client_FBPosts.length;i++) {
        if (_FBOverview.find({}, {reactive: false}).count() == 4) { break; }
        var message, name, uid, link;
        var next_post = client_FBPosts[i+1];
        var post = client_FBPosts[i];
        var comments_list = FBComments.find({post_id: post.post_id}, {sort: {created_time: -1}}).fetch();
        var overview_type = "post"
        // insert the latest comments
        for (var x=0;x<comments_list.length;x++) {
            if (next_post != undefined) {
                if (comments_list[x].created_time > next_post.updated_time) {
                    uid = comments_list[x].owner.id;
                    name = comments_list[x].owner.name;
                    message = "commented on your " + post.fields.type + " : \"" + comments_list[x].message + " \"";

                    // skip comments by page id
                    if (uid == page_id) { continue; }
                    for (var z=0;z<post.fields.actions.length;z++) {
                        if (post.fields.actions[z].name == "Comment") { link = post.fields.actions[z].link; }
                    }
                    _FBOverview.insert({message: message, name: name, uid: uid, datetime: comments_list[x].created_time, link: link});
                    overview_type = "comment";
                    if (_FBOverview.find({}, {reactive: false}).count() == 4) { break; }
=======
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
>>>>>>> brand-mentions
                }
            } else {
                // todo: consider logic when there is comments in current post and no next post
            }
<<<<<<< HEAD
        }
        if (overview_type == "comment") { continue; }
        message = "posted on your wall : \"";
        // skip comments by page id
        if (post.fields.from.id == page_id) { continue; }
        for (var z=0;z<post.fields.actions.length;z++) {
            if (post.fields.actions[z].name == "Comment") { link = post.fields.actions[z].link; }
        }
        _FBOverview.insert({message: message += post.fields.message != undefined ? post.fields.message + "\"" : post.fields.story + "\"", name: post.fields.from.name, uid: post.fields.from.id, datetime: post.updated_time});
=======

            if (_FBOverview.find({}, {reactive: false}).count() == 5) {
                break;
            }
        }
        if (_FBOverview.find({}, {reactive: false}).count() == 5) {
            break;
        }
>>>>>>> brand-mentions
    }

    return _FBOverview.find();
};

<<<<<<< HEAD
Template.overview_twitter.twitter_overview = function() {
=======

Template.overview.twitter_overview = function () {
>>>>>>> brand-mentions
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
