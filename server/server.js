BACKEND_URL = "http://127.0.0.1:5000/";
PLATFORM_URL = "http://127.0.0.1:3000/"

/*
    Navigation Menu
 */

Meteor.publish("cp_menu", function() {
   return CPMenu.find({uid: this.userId});
});

/*
    Accounts
 */

Meteor.publish("accounts", function() {
    return [
        FBUsers.find({u_id: this.userId}),
        TWUsers.find({u_id: this.userId}),
        FSQUsers.find({u_id: this.userId})
    ]
});

/*
    Campaigns
 */

Meteor.publish("mapping", function() {
    return [
        BrandMappings.find({uid: this.userId}),
        Mappings.find({uid: this.userId}),
        Campaigns.find({uid: this.userId})
    ];
});

/*
    Publish facebook page, posts, comments based on user's facebook pages added
 */

Meteor.publish("facebook", function(brand) {
    if (brand == undefined) { return; }
    var brand_obj = (BrandMappings.findOne({uid: this.userId, brand_name: brand})).facebook;
    if (brand_obj == undefined) { return; }
    var page_id = brand_obj.id;
    var post_list = FBPosts.find({page_id: page_id}).fetch();
    var postid_list = [];
    for (var i=0;i<post_list.length;i++) {
        postid_list.push(post_list[i].post_id);
    }
    console.log(FBComments.find().count());

    return [
        FBPages.find({page_id: page_id}),
        FBPosts.find({page_id: page_id}, {sort: {updated_time: -1}}),
        FBComments.find({post_id: {$exists: true, $in: postid_list}}, {sort: {created_time: -1}})
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


// Add a record for brand mapping on new user registration
Accounts.onCreateUser(function(options, user) {
    var result = Meteor.http.put(BACKEND_URL + "account/user/", {params: {user_id: user._id}});
    if (result.statusCode !== 200) {
        console.log(result.error);
    }

    return user;
});

Meteor.methods({
    get_platform_url: function() {
        return PLATFORM_URL;
    },
    get_facebook_auth_url: function(p, b) {
        this.unblock();
        var result = Meteor.http.get(BACKEND_URL + "social_connect/facebook/auth/", {params: {platform: p, brand_name: b}});
        if (result.statusCode !== 200) {
            console.log(result.error);
            return;
        } else {
            return result.data.auth_url;
        }
    },
    connect_facebook_auth: function(c, brand_name) {
        this.unblock();
        var result = Meteor.http.put(BACKEND_URL + "social_connect/facebook/", {params: {user_id: this.userId, code: c, brand_name: brand_name}});
        if (result.statusCode !== 200) {
            console.log(result.error);
        }
    },
    get_facebook_pages: function(brand_name) {
        this.unblock();
        var result = Meteor.http.get(BACKEND_URL + "social_connect/facebook/page/", {params: {user_id: this.userId, brand_name: brand_name}});
        if (result.statusCode !== 200) {
            console.log(result.error);
            return;
        }
        else {
            return result.data.page_list;
        }
    },
    put_facebook_page: function(brand_name, page_id) {
        this.unblock();
        var result = Meteor.http.put(BACKEND_URL + "social_connect/facebook/page/", {params: {user_id: this.userId, brand_name: brand_name, page_id: page_id}});
        if (result.statusCode !== 200) {
            console.log(result.error);
        }
        _FBPages.remove({});
    },
    del_facebook_user: function(brand_name) {
        this.unblock();
        var result = Meteor.http.del(BACKEND_URL + "social_connect/facebook/user/?user_id=" + this.userId + "&brand_name=" + brand_name);
        if (result.statusCode !== 200) {
            console.log(result.error);
        }
    },
    del_facebook_page: function(brand_name) {
        this.unblock();
        var result = Meteor.http.del(BACKEND_URL + "social_connect/facebook/page/?user_id=" + this.userId + "&brand_name=" + brand_name);
        if (result.statusCode !== 200) {
            console.log(result.error);
        }
    }
})