@ORDER_SESSION =
    SUBURL: "ORDERSubUrl"
    ID_FILTER: "ORDERIdFilter"
    USER_ID_FILTER: "ORDERUserIdFilter"

@ORDER_TEMPLATE =
    MAIN: "order_all"
    NEW: "order_compose"

@ORDER_PAGE =
    MAIN: "all"
    COMPOSE: "new"

ITEMS_PER_PAGE = 20

#-- order --#

Template.order.rendered = ->
    scrollTop()

Template.order.view = ->
    Template[getPage()]()

#-- order_all --#

Template.order_all.created = ->
    Meteor.subscribe "all_users"
    Meteor.subscribe "all_items"
    Meteor.subscribe "all_orders"
    Session.set ORDER_SESSION.USER_ID_FILTER, null
    Session.set ORDER_SESSION.ID_FILTER, null

Template.order_all.rendered = ->
    $("#filter-by-id").off "change paste keyup"
    $("#filter-by-id").on "change paste keyup", (evt) ->
        Session.set ORDER_SESSION.ID_FILTER, $(evt.target).val()

Template.order_all.events =
    "click #search-by-user": (evt) ->
        searchUserId (success, user_id, username, email) ->
            $("#filter-by-id").val("")
            Session.set ORDER_SESSION.ID_FILTER, null
            Session.set ORDER_SESSION.USER_ID_FILTER, user_id

    "click [data-expand]": (evt) ->
        elem = $(evt.target).parents("[data-expand]")[0]
        id = $(elem).attr("data-expand")
        $("[data-expanded]").addClass "hidden"
        $("[data-expanded=#{id}]").removeClass("hidden")


Template.order_all.orders = ->
    page_no_0_idx = getPageNo() - 1
    id_filter = Session.get ORDER_SESSION.ID_FILTER
    user_id_filter = Session.get ORDER_SESSION.USER_ID_FILTER
    dic = {}
    if id_filter? and id_filter.length > 0
        dic = {
            _id: new Meteor.Collection.ObjectID(id_filter)
        }
    else if user_id_filter? and user_id_filter.length > 0
        dic = {
            user_id: user_id_filter
        }


    Order.find dic, {
        limit: ITEMS_PER_PAGE
        skip: page_no_0_idx * ITEMS_PER_PAGE
        sort:
            modification_timestamp_utc: -1
        transform: (doc) ->
            last_mod = moment(doc.timestamp_utc)
            doc["id"] = doc._id.valueOf()
            doc["timestamp"] = last_mod.format('MMMM Do YYYY')

            all_items = []
            items_descriptive = []
            _.each doc.items, (item_desc_obj) ->
                item = ITMItems.findOne {_id: item_desc_obj.obj_id}
                qty = item_desc_obj.quantity
                all_items.push item.name
                items_descriptive.push "#{item.name} &times; #{qty}"
            doc["all_items"] = all_items.join ", "
            doc["item_descriptive"] = items_descriptive.join "</br>"
            doc
    }

Template.order_all.current_page = ->
    getPageNo()

Template.order_all.next_page_url = ->
    page_no = getPageNo()
    next_page = page_no + 1
    return "/order/#{next_page}"

Template.order_all.prev_page_url = ->
    page_no = getPageNo()
    prev_page = page_no - 1
    return "/order/#{prev_page}"

Template.order_all.has_next = ->
    total_items = Order.find({}).count()
    total_pages = Math.ceil(total_items / ITEMS_PER_PAGE)
    getPageNo() < total_pages

Template.order_all.has_prev = ->
    getPageNo() >= 2

#-- order_compose --#

Template.order_compose.created = ->
    Meteor.subscribe "all_users"
    Meteor.subscribe "all_shipping"
    Meteor.subscribe "all_items"

Template.order_compose.rendered = ->
    $("#order-compose-form").off "submit"
    $("#order-compose-form").on "submit", (evt) ->
        evt.preventDefault()
        createOrder()

Template.order_compose.shipping_methods = ->
    ShippingRule.find {},{
        transform: (doc) ->
            doc["id"] = doc._id.valueOf()
            doc
    }

Template.order_compose.events =
    "click .submit-btn": (evt) ->
        evt.preventDefault()
        createOrder()

    "click #add-order-item-btn": (evt) ->
        order_item_template = $("#order-item-template").clone().removeAttr("id").removeClass("hidden")
        $("#order-item-container").append order_item_template
        rehashOrderItems()

    "click .rm-order-item-btn": (evt) ->
        $(evt.target).parents(".control-group").remove()
        rehashOrderItems()

    "focus #user_id": (evt) ->
        searchUserId (success, user_id, username, email) ->
            if success
                $(evt.target).val("#{username} #{email}").attr("data-user-id", user_id)

    "click .item-selection": (evt) ->
        searchItemId (success, item_id, item_name) ->
            if success
                $(evt.target).val(item_name).attr("data-item-id", item_id)

#-- helper --#

getPageNo = ->
    slugs = Session.get ORDER_SESSION.SUBURL
    if not slugs?
        return 1

    slugs = slugs.split("/")
    slugs = _.filter slugs, (s) ->
        s != ""
    if slugs.length >= 1
        return parseInt slugs[0]
    return 1

rehashOrderItems = ->
    i = 1
    _.each $(".order-item"), (order_item) ->
        if not $(order_item).attr("id")?
            $(order_item).find(".item_no").text(i)
            i += 1


createOrder = ->
    if $("#order-compose-form").parsley "validate"
        dic =
            apply_debits_credits: $("apply_debits_credits").val()
            user_id: $("#user_id").attr "data-user-id"
            status: $("#status").val()
            user_notes: $("#request-notes").val()
            admin_notes: $("#admin-notes").val()
            apply_coupon: $("#coupon-code").val()
            shipping_method: $("#shipping-method").val()
            items: []

        _.each $(".order-item"), (order_item) ->
            if not $(order_item).attr("id")?
                quantity = $(".qty").val()
                item_id = $(".item-selection").attr("data-item-id")
                dic.items.push {obj_id: item_id, quantity:quantity}

        dic.items = JSON.stringify(dic.items)

        Meteor.call "new_manual_order", dic, ->
            Router.navigate("/order", {trigger: true})

getPage = () ->
    slugs = Session.get ORDER_SESSION.SUBURL
    if not slugs?
        return ORDER_TEMPLATE.MAIN

    slugs = slugs.split("/")
    slugs = _.filter slugs, (s) ->
        s != ""
    if slugs.length >= 1
        if slugs[0] == ORDER_PAGE.COMPOSE
            return ORDER_TEMPLATE.NEW

    ORDER_TEMPLATE.MAIN