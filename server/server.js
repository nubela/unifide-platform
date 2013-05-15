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
        Mappings.find({uid: this.userId, is_deleted: null}, {sort: {timestamp_utc: -1}}),
        Campaigns.find({uid: this.userId, is_deleted: null}, {sort: {timestamp_utc: -1}})
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

Meteor.publish("facebook", function (brand) {
    if (brand == undefined) {
        return [];
    }
    var brand_obj = (BrandMappings.findOne({uid: this.userId, brand_name: brand})).facebook;
    if (brand_obj == undefined) {
        return [];
    }
    var page_id = brand_obj.id;
    var post_list = FBPosts.find({page_id: page_id}).fetch();
    var postid_list = [];
    for (var i = 0; i < post_list.length; i++) {
        postid_list.push(post_list[i].post_id);
    }

    return [
        FBPages.find({page_id: page_id}),
        FBPosts.find({page_id: page_id, is_deleted: null}),
        FBEvents.find({page_id: page_id, is_deleted: null}),
        FBComments.find({post_id: {$exists: true, $in: postid_list}})
    ];
});

Meteor.publish("twitter", function (brand) {
    if (brand == undefined) {
        return [];
    }
    var brand_obj = (BrandMappings.findOne({uid: this.userId, brand_name: brand})).twitter;
    if (brand_obj == undefined) {
        return [];
    }
    var twitter_id = brand_obj.id;

    return [
        TWTweets.find({tw_id: twitter_id, is_deleted: null}, {sort: {created_at: -1}})
    ];
});

Meteor.publish("foursquare", function (brand) {
    if (brand == undefined) {
        return [];
    }
    var brand_obj = (BrandMappings.findOne({uid: this.userId, brand_name: brand})).foursquare;
    if (brand_obj == undefined) {
        return [];
    }
    var venue_list = brand_obj.venues;

    return [
        FSQPageUpdates.find({venue_id: {$exists: true, $in: venue_list}, is_deleted: null}, {sort: {created_at: -1}}),
        FSQTips.find({venue_id: {$exists: true, $in: venue_list}, is_deleted: null}, {sort: {createdAt: -1}})
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

serialize = function (obj) {
    var str = [];
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    }
    return str.join("&");
}


function put_brand_mention_keyword(keyword) {
    this.unblock();
    Meteor.http.put(BACKEND_URL + "brand_mention/keyword/", {params: {
        keyword: keyword
    }});
}

function del_brand_mention_keyword(keyword) {
    this.unblock();
    Meteor.http.del(BACKEND_URL + "brand_mention/keyword/?" + serialize({
        keyword: keyword
    }));
}

function get_child_containers_and_items(path_lis) {
    this.unblock();
    var resp = Meteor.http.get(BACKEND_URL + "container+item/?" + serialize({
        path_lis: JSON.stringify(path_lis)
    }));
    return JSON.parse(resp.content);
}

function put_container(path_lis, description) {
    this.unblock();
    Meteor.http.put(BACKEND_URL + "container/", {params: {
        path_lis: JSON.stringify(path_lis),
        description: description
    }});
}

function del_item(item_id) {
    this.unblock();
    Meteor.http.del(BACKEND_URL + "item/?" + serialize({
        item_id: item_id
    }));
}

function get_biz_info() {
    this.unblock();
    resp = Meteor.http.get(BACKEND_URL + "business/info/")
    return JSON.parse(resp.content);
}

function get_all_orders() {
    this.unblock();
    resp = Meteor.http.get(BACKEND_URL + "order/")
    return JSON.parse(resp.content);
}

function del_container(container_id) {
    this.unblock();
    Meteor.http.del(BACKEND_URL + "container/?" + serialize({
        container_id: container_id
    }));
}

Meteor.methods({
    get_all_orders: get_all_orders,
    get_biz_info: get_biz_info,
    put_container: put_container,
    get_child_containers_and_items: get_child_containers_and_items,
    put_brand_mention_keyword: put_brand_mention_keyword,
    del_brand_mention_keyword: del_brand_mention_keyword,
    del_item: del_item,
    del_container: del_container,
    get_platform_url: function () {
        return PLATFORM_URL;
    },
    get_facebook_auth_url: function (p, b) {
        this.unblock();
        var result = Meteor.http.get(BACKEND_URL + "social_connect/facebook/auth/", {params: {platform: p, brand_name: b}});
        if (result.statusCode !== 200) {
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
    },
    get_twitter_auth_url: function (platform, brand) {
        this.unblock();
        var result = Meteor.http.get(BACKEND_URL + "social_connect/twitter/auth/", {params: {user_id: this.userId, brand_name: brand}});
        if (result.statusCode !== 200) {
            console.log(result.error);
            return;
        } else {
            return result.data;
        }
    },
    connect_twitter_auth: function (verifier, brand_name) {
        this.unblock();
        var result = Meteor.http.put(BACKEND_URL + "social_connect/twitter/", {params: {user_id: this.userId,
            brand_name: brand_name, oauth_verifier: verifier}});
        if (result.statusCode !== 200) {
            console.log(result.error);
        }
    },
    del_twitter_user: function (brand_name) {
        this.unblock();
        var result = Meteor.http.del(BACKEND_URL + "social_connect/twitter/user/?user_id=" + this.userId + "&brand_name=" + brand_name);
        if (result.statusCode !== 200) {
            console.log(result.error);
        }
    },
    get_foursquare_auth_url: function (platform, brand) {
        this.unblock();
        var result = Meteor.http.get(BACKEND_URL + "social_connect/foursquare/auth/", {params: {user_id: this.userId, brand_name: brand}})
        if (result.statusCode !== 200) {
            console.log(result.error);
        } else {
            return result.data.auth_url;
        }
    },
    connect_foursquare_auth: function (code, brand_name) {
        this.unblock();
        var result = Meteor.http.put(BACKEND_URL + "social_connect/foursquare/", {params: {user_id: this.userId, brand_name: brand_name, code: code}})
        if (result.statusCode !== 200) {
            console.log(result.error);
        }
    },
    get_foursquare_venues_managed: function (brand_name) {
        this.unblock();
        var result = Meteor.http.get(BACKEND_URL + "social_connect/foursquare/venue/managed/", {params: {user_id: this.userId, brand_name: brand_name}})
        if (result.statusCode !== 200) {
            console.log(result.error);
        } else {
            return result.data.venues;
        }
    },
    put_foursquare_venue: function (brand_name, venue_id) {
        this.unblock();
        var result = Meteor.http.put(BACKEND_URL + "social_connect/foursquare/venue/", {params: {user_id: this.userId, brand_name: brand_name, venue_id: venue_id}})
        if (result.statusCode !== 200) {
            console.log(result.error);
        }
    },
    del_foursquare_venue: function (brand_name, venue_id) {
        this.unblock();
        var result = Meteor.http.del(BACKEND_URL + "social_connect/foursquare/venue/?user_id=" + this.userId + "&brand_name=" + brand_name + "&venue_id=" + venue_id)
        if (result.statusCode !== 200) {
            console.log(result.error);
        }
    },
    del_foursquare_user: function (brand_name) {
        this.unblock();
        var result = Meteor.http.del(BACKEND_URL + "social_connect/foursquare/user/?user_id=" + this.userId + "&brand_name=" + brand_name)
        if (result.statusCode !== 200) {
            console.log(result.error);
        }
    },
    http_api: function (verb, url, args) {
        this.unblock();
        console.log(args);
        var result = Meteor.http[verb](BACKEND_URL + url, {params: args});
        if (result.statusCode !== 200) {
            console.log(result.error);
        } else {
            return result;
        }
    }
});
