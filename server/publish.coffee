Meteor.publish "all_discounts",  ->
    Discount.find {}

Meteor.publish "all_containers",  ->
    ITMChildCategories.find {}

Meteor.publish "all_items",  ->
    ITMItems.find {}

Meteor.publish "all_groups",  ->
    Group.find {}

Meteor.publish "all_users",  ->
    Meteor.users.find()

Meteor.publish "container_item_media", (container_path_lis = []) ->
    ###
    Fetches the media objects found in the given container path lis
    ###
    main_container = ITMChildCategories.findOne
        materialized_path: container_path_lis

    if container_path_lis.length != 0 and not main_container?
        return ITMItems.find {}, limit: 0

    items = ITMItems.find
        container_id: main_container._id

    media_ids = []
    for i in items.fetch()
        if i.media_id?
            media_ids.push i.media_id
        for c in i.custom_media_lis
            media_ids.push i[c]

    ITMMedia.find
        _id:
            $in: media_ids

Meteor.publish "child_containers", (container_path_lis = []) ->
    ###
    Fetches the child containers for a given container with provided path_lis
    ###
    main_container = ITMChildCategories.findOne
        materialized_path: container_path_lis

    if container_path_lis.length != 0 and not main_container?
        return ITMChildCategories.find {}, limit: 0

    ITMChildCategories.find
        $or:
            parent_id: if container_path_lis.length != 0 then main_container._id else null
            materialized_path: container_path_lis


Meteor.publish "container_items", (container_path_lis = []) ->
    ###
    Fetches the items for a given container with the provided path_lis
    ###
    main_container = ITMChildCategories.findOne
        materialized_path: container_path_lis

    if container_path_lis.length != 0 and not main_container?
        return ITMItems.find {}, limit: 0

    ITMItems.find
        container_id: main_container._id

Meteor.publish "brand_config", ->
    BrandConfig.find({})

Meteor.publish "cp_menu", ->
    CPMenu.find({uid: this.userId})

Meteor.publish "accounts", ->
    [
        FBUsers.find({u_id: this.userId}),
        TWUsers.find({u_id: this.userId}),
        FSQUsers.find({u_id: this.userId})
    ]

Meteor.publish "mapping", ->
    [
        BrandMappings.find({uid: this.userId}),
        Mappings.find({uid: this.userId, is_deleted: null}, {sort: {timestamp_utc: -1}}),
        Campaigns.find({uid: this.userId, is_deleted: null}, {sort: {timestamp_utc: -1}})
    ]

Meteor.publish "keyword", ->
    [
        Keywords.find({})
    ]

Meteor.publish "brand_mention", ->
    return [
        BrandMentions.find({})
    ]

Meteor.publish "facebook", (brand) ->
    if not brand?
        return []

    brand_obj = (BrandMappings.findOne({uid: this.userId, brand_name: brand})).facebook
    if not brand_obj?
        return []

    page_id = brand_obj.id
    post_list = FBPosts.find({page_id: page_id}).fetch()
    postid_list = []
    for i in [0..post_list.length - 1]
        postid_list.push post_list[i].post_id

    return_coll = []
    if FBPages.find().count() > 0
        return_coll.push(FBPages.find({page_id: page_id}))

    if FBPosts.find().count() > 0
        return_coll.push(FBPosts.find({page_id: page_id, is_deleted: null}))

    if FBEvents.find().count() > 0
        return_coll.push(FBEvents.find({page_id: page_id, is_deleted: null}))

    if FBComments.find().count() > 0
        return_coll.push(FBComments.find({post_id: {$exists: true, $in: postid_list}}))

    return_coll

Meteor.publish "twitter", (brand) ->
    if not brand?
        return []

    brand_obj = (BrandMappings.findOne({uid: this.userId, brand_name: brand})).twitter
    if not brand_obj?
        return []

    twitter_id = brand_obj.id

    return_coll = []
    if TWTweets.find().count() > 0
        return_coll.push(TWTweets.find({tw_id: twitter_id, is_deleted: null}, {sort: {created_at: -1}}))

    return_coll

Meteor.publish "foursquare", (brand) ->
    if not brand?
        return []

    brand_obj = (BrandMappings.findOne({uid: this.userId, brand_name: brand})).foursquare
    if not brand_obj?
        return []

    venue_list = brand_obj.venues

    return_coll = []
    if FSQPageUpdates.find().count() > 0
        return_coll.push(FSQPageUpdates.find({venue_id: {$exists: true, $in: venue_list}, is_deleted: null},
        {sort: {created_at: -1}}))

    if FSQTips.find().count() > 0
        return_coll.push(FSQTips.find({venue_id: {$exists: true, $in: venue_list}, is_deleted: null},
        {sort: {createdAt: -1}}))

    return return_coll