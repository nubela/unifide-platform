@COUPON_SESSION =
    SUBURL: "CPSubUrl"

@COUPON_TEMPLATE =
    MAIN: "coupon_all"
    NEW: "coupon_compose"

@COUPON_PAGE =
    MAIN: "all"
    COMPOSE: "new"

IS_COUPON_CREATING = false

#-- coupon --#

Template.coupon.rendered = ->
    scrollTop()

Template.coupon.view = ->
    Template[getCouponPage()]()

#-- coupon_compose --#

Template.coupon_compose.rendered = ->
    Meteor.subscribe "all_groups"
    Meteor.subscribe "all_users"
    bindCouponComposeForm()
    $("#compose-form").submit (evt) ->
        evt.preventDefault()
        createCoupon()

Template.coupon_compose.groups = ->
    Group.find({}, {sort: {name: 1}})

Template.coupon_compose.events =
    "click .submit-btn": ->
        $("#compose-form").submit()

bindCouponComposeForm = ->
    $("#user-applicable").change ->
        $(".select-specific-user").addClass "hidden"
        $(".select-user-grp").addClass "hidden"
        if $(this).val() == "group"
            $(".select-user-grp").removeClass "hidden"
        else if $(this).val() == "specific_user"
            $(".select-specific-user").removeClass "hidden"

    $("#user").focus ->
        searchUserId (res, userid, username, email) =>
            if res
                $(this).val("#{username} #{email}")
                $(this).attr("data-user-id", userid)

    $("#applicable-on").change ->
        $("#select-container").addClass("hidden")
        $("#container-id").removeAttr("data-required")
        $("#select-item").addClass("hidden")
        $("#item-id").removeAttr("data-required")
        if $(this).val() == "item"
            $("#select-item").removeClass("hidden")
            $("#item-id").attr("data-required", "true")
        else if $(this).val() == "container"
            $("#select-container").removeClass("hidden")
            $("#container-id").attr("data-required", "true")

    $("#discount-lifetime-type").change ->
        $(".date-selectors").addClass("hidden")
        if $(this).val() == "duration"
            $(".date-selectors").removeClass("hidden")

    $(".date-selectors").datetimepicker
        language: 'en'

    $("#item-id").focus ->
        searchItemId (success, id, name) =>
            if success
                $(this).val(name)
                $(this).attr("data-item-id", id)

    $("#container-id").focus ->
        searchContainerId (success, id, name) =>
            if success
                $(this).val(name)
                $(this).attr("data-container-id", id)

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

createCoupon = ->
    if $("#coupon-compose-form").parsley("validate")
        if not IS_COUPON_CREATING
            IS_COUPON_CREATING = true
            Meteor.call "new_coupon", {
            }, ->
                IS_COUPON_CREATING = false
                Router.navigate "/coupon", true