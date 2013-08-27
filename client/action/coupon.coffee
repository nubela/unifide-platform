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
    $("#coupon-compose-form").off "submit"
    bindCouponComposeForm()
    $("#coupon-compose-form").on "submit", (evt) ->
        evt.preventDefault()
        createCoupon()

Template.coupon_compose.groups = ->
    Group.find({}, {sort: {name: 1}})

#Template.coupon_compose.events =
#    "click .submit-btn": ->
#        $("#coupon-compose-form").submit()

bindCouponComposeForm = ->
    $("#user-applicable").off "change"
    $("#user-applicable").change ->
        $(".select-specific-user").addClass "hidden"
        $(".select-user-grp").addClass "hidden"
        if $(this).val() == "group"
            $(".select-user-grp").removeClass "hidden"
        else if $(this).val() == "specific_user"
            $(".select-specific-user").removeClass "hidden"

    $("#user").off "focus"
    $("#user").focus ->
        searchUserId (res, userid, username, email) =>
            if res
                $(this).val("#{username} #{email}")
                $(this).attr("data-user-id", userid)

    $("#applicable-on").off "change"
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

    $("#lifetime-type").off "change"
    $("#lifetime-type").change ->
        $(".date-selectors").addClass("hidden")
        if $(this).val() == "duration"
            $(".date-selectors").removeClass("hidden")

    $(".date-selectors").datetimepicker
        language: 'en'

    $("#item-id").off "focus"
    $("#item-id").focus ->
        searchItemId (success, id, name) =>
            if success
                $(this).val(name)
                $(this).attr("data-item-id", id)

    $("#container-id").off "focus"
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

        error = false
        item_id = $("#item-id").attr("data-item-id")
        container_id = $("#container-id").attr("data-container-id")
        user_id = $("#user").attr("data-user-id")

        if $("#applicable-on").val() == "item" and not item_id?
            error = true
            flashAlert "Oops", "You need to select an item to continue.."

        if $("#applicable-on").val() == "container" and not container_id?
            error = true
            flashAlert "Oops", "You need to select a container to continue.."

        if $("#lifetime-type").val() == "duration" and ($("#begins-on").val() == "" or $("#ends-on").val() == "")
            error = true
            flashAlert "Oops","You need to select a beginning and expiry date to continue.."

        if $("#user-applicable").val() == "group" and not $("#user-groups").val()?
            error = true
            flashAlert "Oops","You need to select at least a user group to continue.."

        if $("#user-applicable").val() == "specific_user" and not user_id?
            error = true
            flashAlert "Oops","You need to select a user to continue.."

        if not error
            Meteor.call "new_coupon", {
                name: $("#name").val()
                description: $("#description").val()
                applicable_on: $("#applicable-on").val()
                item_id: item_id
                container_id: container_id
                coupon_type: $("#coupon-type").val()
                amount: $("#amount").val()
                min_spending: $("#min-spending").val()
                lifetime_type: $("#lifetime-type").val()
                begins_on: $("#begins-on").val()
                ends_on: $("#ends-on").val()
                user_applicable: $("#user-applicable").val()
                user_groups: $("#user-groups").val()
                user_id: user_id
            }, ->
                IS_COUPON_CREATING = false
                Router.navigate "/coupon", true