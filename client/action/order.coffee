@ORDER_SESSION =
    SUBURL: "ORDERSubUrl"

@ORDER_TEMPLATE =
    MAIN: "order_all"
    NEW: "order_compose"

@ORDER_PAGE =
    MAIN: "all"
    COMPOSE: "new"

ORDERS_PAGE_PAGE = 20

#-- order --#

Template.order.view = ->
    Template[getPage()]()

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
            Router.navigate "/order"

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