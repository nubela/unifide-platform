@DISCOUNT_SESSION =
    SUBURL: "DCSubUrl"

@DISCOUNT_TEMPLATE =
    MAIN: "discount_all"
    NEW: "discount_compose"

@DISCOUNT_PAGE =
    MAIN: "all"
    COMPOSE: "new"

IS_DISCOUNT_CREATING = false
ITEMS_PER_PAGE = 20

#-- discount --#

Template.discount.rendered = ->
    scrollTop()

Template.discount.view = ->
    Template[getDiscountPage()]()

#-- discount_all --#

Template.discount_all.rendered = ->
    Meteor.subscribe "all_containers"
    Meteor.subscribe "all_items"
    Meteor.subscribe "all_discounts"
    null

Template.discount_all.events =
    "click [data-expand]": (evt) ->
        elem = $(evt.target).parents("[data-expand]")[0]
        id = $(elem).attr("data-expand")
        $("[data-expanded]").addClass "hidden"
        $("[data-expanded=#{id}]").removeClass("hidden")

Template.discount_all.current_page = ->
    getDiscountPageNo()

Template.discount_all.next_page_url = ->
    page_no = getDiscountPageNo()
    next_page = page_no + 1
    return "/discount/#{next_page}"

Template.discount_all.prev_page_url = ->
    page_no = getDiscountPageNo()
    prev_page = page_no - 1
    return "/discount/#{prev_page}"

Template.discount_all.has_next = ->
    total_items = Discount.find({}).count()
    total_pages = Math.ceil(total_items / ITEMS_PER_PAGE)
    getDiscountPageNo() < total_pages

Template.discount_all.has_prev = ->
    getDiscountPageNo() >= 2

Template.discount_all.discounts = ->
    page_no_0_idx = getDiscountPageNo() - 1
    Discount.find {}, {
        limit: ITEMS_PER_PAGE
        skip: page_no_0_idx * ITEMS_PER_PAGE
        sort:
            modification_timestamp_utc: -1
        transform: (doc) ->
            doc["id"] = doc._id.valueOf()
            doc["item_scope_desc"] = getDiscountItemScopeDesc(doc)
            doc["duration_desc"] = getDiscountDurationDesc(doc)
            doc["min_order"] = ""
            doc
    }

#-- discount_compose --#

Template.discount_compose.rendered = ->
    bindFormElements()
    $("#discount-compose-form").submit (evt) ->
        evt.preventDefault()
        createDiscount()


Template.discount_compose.events =
    "click #save-discount-btn": ->
        $("#discount-compose-form").submit()

#-- helper --#

getDiscountPageNo = ->
    slugs = Session.get DISCOUNT_SESSION.SUBURL
    if not slugs?
        return 1

    slugs = slugs.split("/")
    slugs = _.filter slugs, (s) ->
        s != ""
    if slugs.length >= 1
        return parseInt slugs[0]
    return 1

getDiscountPage = ->
    slugs = Session.get DISCOUNT_SESSION.SUBURL
    if not slugs?
        return DISCOUNT_TEMPLATE.MAIN

    slugs = slugs.split("/")
    slugs = _.filter slugs, (s) ->
        s != ""
    if slugs.length >= 1
        if slugs[0] == DISCOUNT_PAGE.COMPOSE
            return DISCOUNT_TEMPLATE.NEW

    DISCOUNT_TEMPLATE.MAIN


bindFormElements = ->
    #toggle visible form elements on different #applicable-on selections
    $("#applicable-on").change ->
        $("#discount-select-container").addClass("hidden")
        $("#discount-container-id").removeAttr("data-required")
        $("#discount-select-item").addClass("hidden")
        $("#discount-item-id").removeAttr("data-required")
        if $(this).val() == "item"
            $("#discount-select-item").removeClass("hidden")
            $("#discount-item-id").attr("data-required", "true")
        else if $(this).val() == "container"
            $("#discount-select-container").removeClass("hidden")
            $("#discount-container-id").attr("data-required", "true")

    $("#discount-lifetime-type").change ->
        $(".date-selectors").addClass("hidden")
        if $(this).val() == "duration"
            $(".date-selectors").removeClass("hidden")

    $(".date-selectors").datetimepicker
        language: 'en'

    $("#discount-item-id").focus ->
        searchItemId (success, id, name) =>
            if success
                $(this).val(name)
                $(this).attr("data-item-id", id)

    $("#discount-container-id").focus ->
        searchContainerId (success, id, name) =>
            if success
                $(this).val(name)
                $(this).attr("data-container-id", id)


createDiscount = ->
    if $("#discount-compose-form").parsley("validate")
        if not IS_DISCOUNT_CREATING
            IS_DISCOUNT_CREATING = true
            Meteor.call "new_discount", {
                name: $.trim $("#discount-name").val()
                description: $.trim $("#description").val()
                applicable_on: $("#applicable-on").val()
                item_id: $("#discount-item-id").attr("data-item-id")
                container_id: $("#discount-container-id").attr("data-container-id")
                discount_type: $("#discount-type").val()
                amount: $("#amount").val()
                min_order: $("#min-spending").val()
                duration: $("#discount-lifetime-type").val()
                begins_on: $("#begins-on").val()
                ends_on: $("#ends-on").val()
            }, ->
                IS_DISCOUNT_CREATING = false
                Router.navigate "/discount", true
                flashAlert "Discount is created!", "Your discount item will appear momentarily."

getDiscountItemScopeDesc = (doc) ->
    if doc.discount_scope == "item_only"
        item_obj = getItem(doc.obj_id)
        item_repr = item_obj.container.materialized_path.join(" / ") + " / " + item_obj.name
        return "This discount is applicable on the item: <strong>#{item_repr}</strong>.<br>"
    else if doc.discount_scope == "container_wide"
        container_obj = getContainer(doc.obj_id)
        container_repr = container_obj.materialized_path.join(" / ")
        return "This discount is applicable on the container: <strong>#{container_repr}</strong>.<br>"
    return "This discount is <strong>applicable on all items</strong><br>"

getDiscountDurationDesc = (doc) ->
    if doc.discount_lifetime_type == "limited"
        begins = moment(doc.begins_utc_datetime)
        ends = moment(doc.expire_utc_datetime)
        begins_str = begins.format('MMMM Do YYYY')
        ends_str = ends.format('MMMM Do YYYY')

        return "This discount is valid from #{begins_str} till #{ends_str}<br>"
    return "It is valid until you disable or delete it.<br>"