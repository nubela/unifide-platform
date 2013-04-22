BACKEND_URL = "http://127.0.0.1:5000/";
PLATFORM_URL = "http://127.0.0.1:3000/"

/*
 Navigation Menu
 */

Meteor.publish("cp_menu", function () {
    return CPMenu.find({uid: this.userId});
});

/*
 Accounts
 */

Meteor.publish("accounts", function () {
    return [
        FBUsers.find({u_id: this.userId}),
        TWUsers.find({u_id: this.userId}),
        FSQUsers.find({u_id: this.userId})
    ]
});

/*
 Campaigns
 */

Meteor.publish("mapping", function () {
    return [
        BrandMappings.find({uid: this.userId}),
        Mappings.find({uid: this.userId}),
        Campaigns.find({uid: this.userId})
    ];
});

/*
 Brand Mentions
 */

Meteor.publish("keyword", function () {
    return [
        Keywords.find({})
    ];
});

Meteor.publish("brand_mention", function () {
    return [
        BrandMentions.find({})
    ];
});


/*
 Publish facebook page, posts, comments based on user's facebook pages added
 */

Meteor.publish("facebook", function (posts_offset, comments_offset) {
    posts_offset = typeof posts_offset !== 'undefined' ? posts_offset : 0;
    comments_offset = typeof comments_offset !== 'undefined' ? comments_offset : 0;

    var token_list = FBUsers.find({u_id: this.userId}, {fields: {pages: 1}})

    if (token_list.count() == 0) {
        return [];
    }
    else {
        token_list = token_list.fetch()[0].pages;
    }

    var page_list = FBPages.find({page_access_token: {$exists: true, $in: token_list}}, {sort: {name: 1}}, {limit: 50});
    var pageid_list = [];
    var page_objs = page_list.fetch();
    for (var i = 0; i < page_objs.length; i++) {
        pageid_list.push(page_objs[i].page_id);
    }
    var post_list = FBPosts.find({page_id: {$exists: true, $in: pageid_list}}, {sort: {updated_time: -1}}, {limit: 50}, {skip: posts_offset});
    var postid_list = [];
    var post_objs = post_list.fetch();
    for (var i = 0; i < post_objs.length; i++) {
        postid_list.push(post_objs[i].post_id);
    }

    return [
        page_list,  // FBPages.find()
        post_list,  // FBPosts.find()
        FBComments.find({post_id: {$exists: true, $in: postid_list}}, {sort: {updated_time: -1}}, {limit: 50}, {skip: comments_offset})  // FBComments.find()
    ];
});

/*
 Publish previously cached user info for use in facebook posts, comments
 */
Meteor.publish("facebook_attr", function () {
    return _FBUsers.find({}, {fields: {id: 1, name: 1}}); // _FBUsers.find()
});

Meteor.publish("twitter", function () {
    var twitter_list = TWUsers.find({u_id: this.userId}, {fields: {tw_id: 1}});

    if (twitter_list.count() == 0) {
        return [];
    }
    else {
        twitter_list = twitter_list.fetch();
    }

    // get latest 50 tweets
    var tw_list = []
    for (var i = 0; i < twitter_list.length; i++) {
        tw_list.push(twitter_list[i].tw_id);
    }
    tweets_list = TWTweets.find({tw_id: {$exists: true, $in: tw_list}}, {sort: {created_at: -1}, limit: 50});

    // get cached users for the latest 50 tweets
    tweets = tweets_list.fetch();
    var user_list = []
    for (var i = 0; i < tweets.length; i++) {
        user_list.push(tweets[i].user);
    }
    tweeter_list = _TWUsers.find({tw_id: {$exists: true, $in: user_list}});

    return [
        tweets_list,
        tweeter_list
    ];
});


// Add a record for brand mapping on new user registration
Accounts.onCreateUser(function (options, user) {
    var result = Meteor.http.put(BACKEND_URL + "account/user/", {params: {user_id: user._id}});
    if (result.statusCode !== 200) {
        console.log(result.error);
    }

    return user;
});

function put_brand_mention_keyword(keyword) {
    this.unblock();
    Meteor.http.put(BACKEND_URL + "brand_mention/keyword/", {params: {
        keyword: keyword
    }});
}

function del_brand_mention_keyword(keyword) {
    this.unblock();
    Meteor.http.del(BACKEND_URL + "brand_mention/keyword/", {params: {
        keyword: keyword
    }});
}

Meteor.methods({
    put_brand_mention_keyword: put_brand_mention_keyword,
    del_brand_mention_keyword: del_brand_mention_keyword,

    get_platform_url: function () {
        return PLATFORM_URL;
    },
    get_facebook_auth_url: function (p, b) {
        this.unblock();
        var result = Meteor.http.get(BACKEND_URL + "social_connect/facebook/auth/", {params: {platform: p, brand_name: b}});
        if (result.statusCode !== 200) {
            console.log(result.error);
            return;
        } else {
            return result.data.auth_url;
        }
    },
    connect_facebook_auth: function (c, brand_name) {
        this.unblock();
        var result = Meteor.http.put(BACKEND_URL + "social_connect/facebook/", {params: {user_id: this.userId, code: c, brand_name: brand_name}});
        if (result.statusCode !== 200) {
            console.log(result.error);
        }
    },
    get_facebook_pages: function (brand_name) {
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
    put_facebook_page: function (brand_name, page_id) {
        this.unblock();
        var result = Meteor.http.put(BACKEND_URL + "social_connect/facebook/page/", {params: {user_id: this.userId, brand_name: brand_name, page_id: page_id}});
        if (result.statusCode !== 200) {
            console.log(result.error);
        }
        _FBPages.remove({});
    },
    del_facebook_user: function (brand_name) {
        this.unblock();
        var result = Meteor.http.del(BACKEND_URL + "social_connect/facebook/user/?user_id=" + this.userId + "&brand_name=" + brand_name);
        if (result.statusCode !== 200) {
            console.log(result.error);
        }
    },
    del_facebook_page: function (brand_name) {
        this.unblock();
        var result = Meteor.http.del(BACKEND_URL + "social_connect/facebook/page/?user_id=" + this.userId + "&brand_name=" + brand_name);
        if (result.statusCode !== 200) {
            console.log(result.error);
        }
    }
})