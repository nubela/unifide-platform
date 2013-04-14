/*
    Navigation Menu
 */

Meteor.publish("cp_menu", function() {
   return CPMenu.find({uid: this.userId});
});

/*
    Publish facebook page, posts, comments based on user's facebook pages added
 */

Meteor.publish("facebook", function(posts_offset, comments_offset) {
    posts_offset = typeof posts_offset !== 'undefined' ? posts_offset : 0;
    comments_offset = typeof comments_offset !== 'undefined' ? comments_offset : 0;

    var token_list = FBUsers.find({u_id: this.userId}, {fields: {pages: 1}})

    if (token_list.count() == 0) { return []; }
    else { token_list = token_list.fetch()[0].pages; }

    var page_list = FBPages.find({page_access_token: {$exists: true, $in: token_list}}, {sort: {name: 1}}, {limit: 50});
    var pageid_list = [];
    var page_objs = page_list.fetch();
    for (var i=0;i<page_objs.length;i++) { pageid_list.push(page_objs[i].page_id); }
    var post_list = FBPosts.find({page_id: {$exists: true, $in: pageid_list}}, {sort: {updated_time: -1}}, {limit: 50}, {skip: posts_offset});
    var postid_list = [];
    var post_objs = post_list.fetch();
    for (var i=0;i<post_objs.length;i++) { postid_list.push(post_objs[i].post_id); }

    return [
        page_list,  // FBPages.find()
        post_list,  // FBPosts.find()
        FBComments.find({post_id: {$exists: true, $in: postid_list}}, {sort: {updated_time: -1}}, {limit: 50}, {skip: comments_offset})  // FBComments.find()
    ];
});

/*
    Publish previously cached user info for use in facebook posts, comments
 */
Meteor.publish("facebook_attr", function() {
    return _FBUsers.find({}, {fields: {id: 1, name: 1}}); // _FBUsers.find()
});

Meteor.publish("twitter", function() {
    var twitter_list = TWUsers.find({u_id: this.userId}, {fields: {tw_id: 1}});

    if (twitter_list.count() == 0) { return []; }
    else { twitter_list = twitter_list.fetch(); }

    // get latest 50 tweets
    var tw_list = []
    for (var i=0;i<twitter_list.length;i++) { tw_list.push(twitter_list[i].tw_id); }
    tweets_list = TWTweets.find({tw_id: {$exists: true, $in: tw_list}}, {sort: {created_at: -1}, limit: 50});

    // get cached users for the latest 50 tweets
    tweets = tweets_list.fetch();
    var user_list = []
    for (var i=0;i<tweets.length;i++) { user_list.push(tweets[i].user); }
    tweeter_list = _TWUsers.find({tw_id: {$exists: true, $in: user_list}});

    return [
        tweets_list,
        tweeter_list
    ];
});