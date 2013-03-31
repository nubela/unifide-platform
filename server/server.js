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
    var post_list = FBPosts.find({page_id: {$exists: true, $in: pageid_list}}, {sort: {updated_time: 0}}, {limit: 50}, {skip: posts_offset});
    var postid_list = [];
    var post_objs = post_list.fetch();
    for (var i=0;i<post_objs.length;i++) { postid_list.push(post_objs[i].post_id); }

    return [
        page_list,  // FBPages.find()
        post_list,  // FBPosts.find()
        FBComments.find({post_id: {$exists: true, $in: postid_list}}, {sort: {updated_time: 0}}, {limit: 50}, {skip: comments_offset})  // FBComments.find()
    ];
});

/*
    Publish previously cached user info for use in facebook posts, comments
 */
Meteor.publish("facebook_attr", function(fb_ids) {
    return _FBUsers.find({id: {$exists: true, $in: fb_ids}}, {fields: {id: 1, name: 1}}).limit(50); // _FBUsers.find()
});