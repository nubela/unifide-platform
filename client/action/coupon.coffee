@COUPON_SESSION =
    SUBURL: "CPSubUrl"

@COUPON_TEMPLATE =
    MAIN: "coupon_all"
    NEW: "coupon_compose"

@COUPON_PAGE =
    MAIN: "all"
    COMPOSE: "new"

#-- coupon --#

Template.coupon.rendered = ->
    scrollTop()

Template.coupon.view = ->
    Template[getCouponPage()]()

#-- coupon_compose --#

Template.coupon_compose.rendered = ->
    Meteor.subscribe "all_groups"
    Meteor.subscribe "all_users"
    searchUserId()

Template.coupon_compose.groups = ->
    Group.find({}, {sort: {name: 1}})

#-- helper --#

getCouponPage = ->
    slugs = Session.get COUPON_SESSION.SUBURL
    if not slugs?
        return COUPON_TEMPLATE.MAIN

    slugs = slugs.split("/")
    slugs = _.filter slugs, (s) ->
        s != ""
    if slugs.length >= 1
        if slugs[0] == COUPON_PAGE.COMPOSE
            return COUPON_TEMPLATE.NEW

    COUPON_TEMPLATE.MAIN