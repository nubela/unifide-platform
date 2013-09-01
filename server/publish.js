// Generated by CoffeeScript 1.6.3
(function() {
  Meteor.publish("all_credit_stores", function() {
    return CreditStore.find();
  });

  Meteor.publish("all_credit_log", function() {
    return CreditLog.find();
  });

  Meteor.publish("all_inventory", function() {
    return Inventory.find();
  });

  Meteor.publish("all_orders", function() {
    return Order.find();
  });

  Meteor.publish("all_taxes", function() {
    return TaxRule.find();
  });

  Meteor.publish("all_shipping", function() {
    return ShippingRule.find();
  });

  Meteor.publish("all_cashbacks", function() {
    return Cashback.find();
  });

  Meteor.publish("all_coupons", function() {
    return Coupon.find();
  });

  Meteor.publish("all_discounts", function() {
    return Discount.find({});
  });

  Meteor.publish("all_containers", function() {
    return ITMChildCategories.find({});
  });

  Meteor.publish("all_items", function() {
    return ITMItems.find({});
  });

  Meteor.publish("all_groups", function() {
    return Group.find({});
  });

  Meteor.publish("all_users", function() {
    return PlopUser.find();
  });

  Meteor.publish("all_admins", function() {
    return Meteor.users.find();
  });

  Meteor.publish("container_item_media", function(container_path_lis) {
    var c, i, items, main_container, media_ids, _i, _j, _len, _len1, _ref, _ref1;
    if (container_path_lis == null) {
      container_path_lis = [];
    }
    /*
    Fetches the media objects found in the given container path lis
    */

    main_container = ITMChildCategories.findOne({
      materialized_path: container_path_lis
    });
    if (container_path_lis.length !== 0 && (main_container == null)) {
      return ITMItems.find({}, {
        limit: 0
      });
    }
    items = ITMItems.find({
      container_id: main_container._id
    });
    media_ids = [];
    _ref = items.fetch();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      i = _ref[_i];
      if (i.media_id != null) {
        media_ids.push(i.media_id);
      }
      _ref1 = i.custom_media_lis;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        c = _ref1[_j];
        media_ids.push(i[c]);
      }
    }
    return ITMMedia.find({
      _id: {
        $in: media_ids
      }
    });
  });

  Meteor.publish("child_containers", function(container_path_lis) {
    var main_container;
    if (container_path_lis == null) {
      container_path_lis = [];
    }
    /*
    Fetches the child containers for a given container with provided path_lis
    */

    main_container = ITMChildCategories.findOne({
      materialized_path: container_path_lis
    });
    if (container_path_lis.length !== 0 && (main_container == null)) {
      return ITMChildCategories.find({}, {
        limit: 0
      });
    }
    return ITMChildCategories.find({
      $or: {
        parent_id: container_path_lis.length !== 0 ? main_container._id : null,
        materialized_path: container_path_lis
      }
    });
  });

  Meteor.publish("container_items", function(container_path_lis) {
    var main_container;
    if (container_path_lis == null) {
      container_path_lis = [];
    }
    /*
    Fetches the items for a given container with the provided path_lis
    */

    main_container = ITMChildCategories.findOne({
      materialized_path: container_path_lis
    });
    if (container_path_lis.length !== 0 && (main_container == null)) {
      return ITMItems.find({}, {
        limit: 0
      });
    }
    return ITMItems.find({
      container_id: main_container._id
    });
  });

  Meteor.publish("brand_config", function() {
    return BrandConfig.find({});
  });

  Meteor.publish("cp_menu", function() {
    return CPMenu.find({
      uid: this.userId
    });
  });

  Meteor.publish("accounts", function() {
    return [
      FBUsers.find({
        u_id: this.userId
      }), TWUsers.find({
        u_id: this.userId
      }), FSQUsers.find({
        u_id: this.userId
      })
    ];
  });

  Meteor.publish("mapping", function() {
    return [
      BrandMappings.find({
        uid: this.userId
      }), Mappings.find({
        uid: this.userId,
        is_deleted: null
      }, {
        sort: {
          timestamp_utc: -1
        }
      }), Campaigns.find({
        uid: this.userId,
        is_deleted: null
      }, {
        sort: {
          timestamp_utc: -1
        }
      })
    ];
  });

  Meteor.publish("keyword", function() {
    return [Keywords.find({})];
  });

  Meteor.publish("brand_mention", function() {
    return [BrandMentions.find({})];
  });

  Meteor.publish("facebook", function(brand) {
    var brand_obj, i, page_id, post_list, postid_list, return_coll, _i, _ref;
    if (brand == null) {
      return [];
    }
    brand_obj = (BrandMappings.findOne({
      uid: this.userId,
      brand_name: brand
    })).facebook;
    if (brand_obj == null) {
      return [];
    }
    page_id = brand_obj.id;
    post_list = FBPosts.find({
      page_id: page_id
    }).fetch();
    postid_list = [];
    for (i = _i = 0, _ref = post_list.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      postid_list.push(post_list[i].post_id);
    }
    return_coll = [];
    if (FBPages.find().count() > 0) {
      return_coll.push(FBPages.find({
        page_id: page_id
      }));
    }
    if (FBPosts.find().count() > 0) {
      return_coll.push(FBPosts.find({
        page_id: page_id,
        is_deleted: null
      }));
    }
    if (FBEvents.find().count() > 0) {
      return_coll.push(FBEvents.find({
        page_id: page_id,
        is_deleted: null
      }));
    }
    if (FBComments.find().count() > 0) {
      return_coll.push(FBComments.find({
        post_id: {
          $exists: true,
          $in: postid_list
        }
      }));
    }
    return return_coll;
  });

  Meteor.publish("twitter", function(brand) {
    var brand_obj, return_coll, twitter_id;
    if (brand == null) {
      return [];
    }
    brand_obj = (BrandMappings.findOne({
      uid: this.userId,
      brand_name: brand
    })).twitter;
    if (brand_obj == null) {
      return [];
    }
    twitter_id = brand_obj.id;
    return_coll = [];
    if (TWTweets.find().count() > 0) {
      return_coll.push(TWTweets.find({
        tw_id: twitter_id,
        is_deleted: null
      }, {
        sort: {
          created_at: -1
        }
      }));
    }
    return return_coll;
  });

  Meteor.publish("foursquare", function(brand) {
    var brand_obj, return_coll, venue_list;
    if (brand == null) {
      return [];
    }
    brand_obj = (BrandMappings.findOne({
      uid: this.userId,
      brand_name: brand
    })).foursquare;
    if (brand_obj == null) {
      return [];
    }
    venue_list = brand_obj.venues;
    return_coll = [];
    if (FSQPageUpdates.find().count() > 0) {
      return_coll.push(FSQPageUpdates.find({
        venue_id: {
          $exists: true,
          $in: venue_list
        },
        is_deleted: null
      }, {
        sort: {
          created_at: -1
        }
      }));
    }
    if (FSQTips.find().count() > 0) {
      return_coll.push(FSQTips.find({
        venue_id: {
          $exists: true,
          $in: venue_list
        },
        is_deleted: null
      }, {
        sort: {
          createdAt: -1
        }
      }));
    }
    return return_coll;
  });

}).call(this);
