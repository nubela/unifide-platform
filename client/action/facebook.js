var facebook_default_template = "facebook_page_activity"

Template.facebook.view = function() {
    var parse = Session.get("page_template").split("_");
    if (parse.length > 1) {
        return Template[Session.get("page_template")]();
    }

    return Template[facebook_default_template]();
}

Template.facebook_page_activity.activity_list = function() {
    if (BrandMappings.findOne({uid: Meteor.userId(), brand_name: Session.get("selected_brand")}) == undefined) { return []; }
    var brand_obj = (BrandMappings.findOne({uid: Meteor.userId(), brand_name: Session.get("selected_brand")})).facebook;
    if (brand_obj == undefined) { return [] }
    var page_id = brand_obj.id;

    _FBActivity.remove({});
    var client_FBPosts = FBPosts.find({}, {sort: {updated_time: -1}}).fetch();
    for (var i=0;i<client_FBPosts.length;i++) {
        if (_FBActivity.find({}, {reactive: false}).count() == 10) { break; }
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
                    _FBActivity.insert({message: message, name: name, uid: uid, datetime: comments_list[x].created_time, link: link});
                    overview_type = "comment";
                    if (_FBActivity.find({}, {reactive: false}).count() == 10) { break; }
                }
            } else {
                // todo: consider logic when there is comments in current post and no next post
            }
        }
        if (overview_type == "comment") { continue; }
        message = "posted on your wall : \"";
        // skip comments by page id
        if (post.fields.from.id == page_id) { continue; }
        for (var z=0;z<post.fields.actions.length;z++) {
            if (post.fields.actions[z].name == "Comment") { link = post.fields.actions[z].link; }
        }
        _FBActivity.insert({message: message += post.fields.message != undefined ? post.fields.message + "\"" : post.fields.story + "\"", name: post.fields.from.name, uid: post.fields.from.id, datetime: post.updated_time});
    }

    return _FBActivity.find();
}