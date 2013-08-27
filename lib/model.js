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
FBEvents = new Meteor.Collection("fb_event");
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
Group = new Meteor.Collection("groups");
PlopUser = new Meteor.Collection("user");

/*
 Settings collection
 */
_Settings = new Meteor.Collection(null);

/*
 Brand Mentions mentions
 */
BrandMentions = new Meteor.Collection("mention");
Keywords = new Meteor.Collection("keyword");

/*
 Web campaigns
 */
_WebOverview = new Meteor.Collection(null);
_CampaignActivity = new Meteor.Collection(null);

/*
 Items
 */
ITMChildCategories = new Meteor.Collection("container");
ITMItems = new Meteor.Collection("item");
ITMMedia = new Meteor.Collection("media");

/*
 Biz info
 */

BIZINFObj = new Meteor.Collection(null);

/*
 Order info
 */

ORDERObj = new Meteor.Collection(null);

/*
 Brand Config
 */
BrandConfig = new Meteor.Collection("brand_config");

/*
 eCommerce models
 */
Discount = new Meteor.Collection("discounts");
Coupon = new Meteor.Collection("coupons");