/*
    Facebook Collections
 */

FBUsers = new Meteor.Collection("fb_user");
FBPages = new Meteor.Collection("fb_page");
FBPosts = new Meteor.Collection("fb_post");
FBComments = new Meteor.Collection("fb_comment");
_FBUsers = new Meteor.Collection("_fb_user");


/*
    Temp Facebook Collections
 */
_FBOverview = new Meteor.Collection(null);