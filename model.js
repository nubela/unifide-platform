/*
    Menu Collections
 */

CPMenu = new Meteor.Collection("cp_menu");

/*
    Facebook Collections
 */

FBUsers = new Meteor.Collection("fb_user");
FBPages = new Meteor.Collection("fb_page");
FBPosts = new Meteor.Collection("fb_post");
FBComments = new Meteor.Collection("fb_comment");
_FBUsers = new Meteor.Collection("_fb_user");


/*
    Twitter Collections
 */

TWUsers = new Meteor.Collection("tw_user");
TWTweets = new Meteor.Collection("tw_tweet");
_TWUsers = new Meteor.Collection("_tw_user");

/*
    Temp Facebook Collections
 */
_FBOverview = new Meteor.Collection(null);


/*
    Temp Twitter Collections
 */
_TWOverview = new Meteor.Collection(null);