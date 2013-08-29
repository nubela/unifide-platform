@COUPON_SESSION =
    SUBURL: "CPSubUrl"

@COUPON_TEMPLATE =
    MAIN: "coupon_all"
    NEW: "coupon_compose"

@COUPON_PAGE =
    MAIN: "all"
    COMPOSE: "new"

ITEMS_PER_PAGE = 20

#-- coupon --#

Template.coupon.created = ->
    scrollTop()

Template.coupon.view = ->
    Template[getCouponPage()]()

#-- coupon_all --#

Template.coupon_all.created = ->
    Meteor.subscribe "all_containers"
    Meteor.subscribe "all_items"
    Meteor.subscribe "all_users"
    Meteor.subscribe "all_coupons"

Template.coupon_all.coupons = ->
    page_no_0_idx = getPageNo() - 1
    Coupon.find {}, {
        limit: ITEMS_PER_PAGE
        skip: page_no_0_idx * ITEMS_PER_PAGE
        sort:
            modification_timestamp_utc: -1
        transform: (doc) ->
            doc["id"] = doc._id.valueOf()
            doc["item_scope_desc"] = getCouponItemScopeDesc(doc)
            doc["user_scope_desc"] = getCouponUserScopeDesc(doc)
            doc["has_disable_btn"] = doc.status == "available"
            doc["min_order"] = "It is only valid for orders with a minimum spending of <strong>$#{doc.order_minimum_spending}</strong>."
            doc["duration_desc"] = getCouponDurationDesc(doc)
            doc
    }

Template.coupon_all.current_page = ->
    getPageNo()

Template.coupon_all.next_page_url = ->
    page_no = getPageNo()
    next_page = page_no + 1
    return "/coupon/#{next_page}"

Template.coupon_all.prev_page_url = ->
    page_no = getPageNo()
    prev_page = page_no - 1
    return "/coupon/#{prev_page}"

Template.coupon_all.has_next = ->
    total_items = Coupon.find({}).count()
    total_pages = Math.ceil(total_items / ITEMS_PER_PAGE)
    getPageNo() < total_pages

Template.coupon_all.has_prev = ->
    getPageNo() >= 2

Template.coupon_all.events =
    "click [data-expand]": (evt) ->
        elem = $(evt.target).parents("[data-expand]")[0]
        id = $(elem).attr("data-expand")
        $("[data-expanded]").addClass "hidden"
        $("[data-expanded=#{id}]").removeClass("hidden")

    "click .disable-coupon": (evt) ->
        coupon_id = $(evt.target).parents("[data-expanded]").attr("data-expanded")
        Coupon.update {_id: new Meteor.Collection.ObjectID(coupon_id)}, {
            $set:
                {status: "disabled"}
        }
        flashAlert "Coupon disabled.", ""

    "click .enable-coupon": (evt) ->
        coupon_id = $(evt.target).parents("[data-expanded]").attr("data-expanded")
        Coupon.update {_id: new Meteor.Collection.ObjectID(coupon_id)}, {
            $set:
                {status: "available"}
        }
        flashAlert "Coupon enabled.", ""

    "click .delete-coupon": (evt) ->
        bootbox.confirm "This step is irreversible. Confirm delete coupon?", (res) ->
            if res
                coupon_id = $(evt.target).parents("[data-expanded]").attr("data-expanded")
                Coupon.remove {_id: new Meteor.Collection.ObjectID(coupon_id)}
                flashAlert "Coupon disabled.", ""

    "click .adjust-valid-times": (evt) ->
        bootbox.prompt "Number of times to adjust to?", (num) ->
            if isNumber num
                coupon_id = $(evt.target).parents("[data-expanded]").attr("data-expanded")
                console.log coupon_id
                Coupon.update {_id: new Meteor.Collection.ObjectID(coupon_id)}, {
                    $set:
                        {valid_times: parseInt(num)}
                }
                flashAlert "Coupon updated", ""

#-- coupon_compose --#

Template.coupon_compose.created = ->
    Meteor.subscribe "all_groups"
    Meteor.subscribe "all_users"
    Meteor.subscribe "all_coupons"

Template.coupon_compose.rendered = ->
    bindCouponComposeForm()
    $("#coupon-compose-form").off "submit"
    $("#coupon-compose-form").on "submit", (evt) ->
        evt.preventDefault()
        createCoupon()

Template.coupon_compose.groups = ->
    Group.find({}, {sort: {name: 1}})

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

getCouponUserScopeDesc = (doc) ->
    if doc.user_scope == "user_group"
        return "And it can be used by users in the following groups: #{doc.user_group.join(", ")}"
    else if doc.user_scope == "specific_user"
        user_obj = User.findOne({_id: doc.user_id})
        return "And it can be used by the following user: <strong>#{user_obj.username} #{user_obj.email}</strong>"
    "And it can be used by <strong>all users</strong>."

getCouponItemScopeDesc = (doc) ->
    if doc.coupon_scope == "item_only"
        item_obj = getItem(doc.obj_id)
        item_repr = item_obj.container.materialized_path.join(" / ") + " / " + item_obj.name
        return "This coupon is applicable on the item: <strong>#{item_repr}</strong>."
    else if doc.coupon_scope == "container_wide"
        container_obj = getContainer(doc.obj_id)
        container_repr = container_obj.materialized_path.join(" / ")
        return "This coupon is applicable on the container: <strong>#{container_repr}</strong>."
    return "This coupon is <strong>applicable on all items</strong>"

getCouponDurationDesc = (doc) ->
    if doc.discount_lifetime_type == "limited"
        begins = moment(doc.begins_utc_datetime)
        ends = moment(doc.expire_utc_datetime)
        begins_str = begins.format('MMMM Do YYYY')
        ends_str = ends.format('MMMM Do YYYY')

        return "This coupon is valid from #{begins_str} till #{ends_str}<br>"
    return "It is valid until you disable or delete it.<br>"

getPageNo = ->
    slugs = Session.get COUPON_SESSION.SUBURL
    if not slugs?
        return 1

    slugs = slugs.split("/")
    slugs = _.filter slugs, (s) ->
        s != ""
    if slugs.length >= 1
        return parseInt slugs[0]
    return 1

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
        coupon_code = $.trim $("#coupon-code").val()

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

        if Coupon.findOne({coupon_code: coupon_code})?
            error = true
            flashAlert "Oops","Coupon code already exists, please try another coupon code..."

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
                valid_times: $("#valid-times").val()
                coupon_code: coupon_code
            }, ->
                Router.navigate "/coupon", true