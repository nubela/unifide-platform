/*
 Menu Collections
 */
CPMenu = new Meteor.Collection("cp_menu");

/*
 Campaign Collections
 */
Campaigns = new Meteor.Collection("campaigns");
Mappings = new Meteor.Collection("mapping");
_CampaignsList = new Meteor.Collection(null);

/*
 Facebook Collections
 */
FBUsers = new Meteor.Collection("fb_user");
FBPages = new Meteor.Collection("fb_page");
FBPosts = new Meteor.Collection("fb_post");
FBComments = new Meteor.Collection("fb_comment");
_FBOverview = new Meteor.Collection(null);
_FBPages = new Meteor.Collection(null);
_FBActivity = new Meteor.Collection(null);

/*
 Twitter Collections
 */
TWUsers = new Meteor.Collection("tw_user");
TWTweets = new Meteor.Collection("tw_tweet");
_TWOverview = new Meteor.Collection(null);
_TWActivity = new Meteor.Collection(null);

/*
 Foursquare Collections
 */
FSQUsers = new Meteor.Collection("fsq_user");
FSQTips = new Meteor.Collection("fsq_tip");
FSQPageUpdates = new Meteor.Collection("fsq_pageupdate");
_FSQVenues = new Meteor.Collection(null);
_FSQOverview = new Meteor.Collection(null);
_FSQActivity = new Meteor.Collection(null);

/*
 Account Collections
 */
BrandMappings = new Meteor.Collection("brand_mapping");

/*
 Settings collection
 */
_Settings = new Meteor.Collection(null);

/*
 Brand Mentions mentions
 */
BrandMentions = new Meteor.Collection("mention");
Keywords = new Meteor.Collection("keyword");