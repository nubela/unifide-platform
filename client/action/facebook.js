var facebook_default_template = "facebook_page_activity"

Template.facebook.view = function() {
    var parse = Session.get("page_template").split("_");
    if (parse.length > 1) {
        return Template[Session.get("page_template")]();
    }

    return Template[facebook_default_template]();
}

Template.facebook_page_activity.events = {
    'click .page-back': function() {
        var page = Session.get("facebook_activity_page");
        if (page == 1) { return; }
        else { Session.set("facebook_activity_page", (page-1)); }
    },
    'click .page-next': function() {
        var page = Session.get("facebook_activity_page");
        var total = Template.facebook_page_activity.total();
        if (page >= (total/10)) { return; }
        else { Session.set("facebook_activity_page", (page+1)); }
    }
}

Template.facebook_page_activity.check_facebook = function() {
    var brand_obj = detect_selected_brand(Session.get("selected_brand"), "facebook");
    if (!brand_obj) { return false; }
    if (!brand_obj.id) { return false; }
    return true;
}

Template.facebook_page_activity.total = function() {
    var selected_brand = Session.get("selected_brand");
    var brand_obj = detect_selected_brand(selected_brand, "facebook");
    if (!brand_obj) { return []; }
    var page_id = brand_obj.id;

    _FBActivity.remove({}, {reactive: false});
    var fb_posts = FBPosts.find({post_id: {$ne: null}}, {sort: {updated_time: -1}}).fetch();
    for (var i=0;i<fb_posts.length;i++) {
        var post = fb_posts[i];
        var post_comments = FBComments.find({post_id: post.post_id}, {sort: {created_time: -1}}).fetch();
        var next_post = (i+1) < fb_posts.length ? fb_posts[i+1] : null;

        if (post_comments.length == 0) {
            if (post.fields.story) { _FBActivity.insert(fb_message_template(post, "story")); }
            else { _FBActivity.insert(fb_message_template(post, "post")); }
        }

        for (var x=0;x<post_comments.length;x++) {
            var comment = post_comments[x];
            if (comment.owner.id == page_id) { continue; }
            if (next_post) {
                if (comment.created_time > next_post.updated_time) {
                    _FBActivity.insert(fb_message_template(comment, "comment", {type: post.fields.type, actions: post.fields.actions}));
                }
            }
            else { _FBActivity.insert(fb_message_template(comment, "comment", {type: post.fields.type, actions: post.fields.actions})); }
        }
    }

    return _FBActivity.find().count();
}

Template.facebook_page_activity.activity_page = function() {
    Session.setDefault("facebook_activity_page", 1);
    return Session.get("facebook_activity_page");
}

Template.facebook_page_activity.activity_list = function() {
    var offset = (Session.get("facebook_activity_page") * 10) - 10;
    return _FBActivity.find({}, {limit: 10, skip: offset}).fetch();
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
            link: fb_load_message_link(status),
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

function fb_load_message_link(status) {
    if (status.fields.actions) {
        return (_.find(status.fields.actions, function(obj) { return obj.name == "Comment"})).link;
    } else {
        return status.fields.link;
    }
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