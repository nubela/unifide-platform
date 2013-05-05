@ORDER_VIEW =
    UPDATE: "order_view_update"
    OVERVIEW: "order_view_overview"
    DETAILS: "order_view_details"
    DETAILS_FILTERED: "order_view_details_filtered"

@ORDER_SESSION =
    OBJ_ID: "order_obj_id"
    VIEW_TYPE: "order_view_type"

@ORDER_TEMPLATE =
    OVERVIEW: "order_table"
    UPDATE: "order_update"
    DETAILS: "order_details"

Template.order.view = ->
    if (Session.get ORDER_SESSION.VIEW_TYPE) == ORDER_VIEW.UPDATE
        Template[ORDER_TEMPLATE.UPDATE]()
    else if (Session.get ORDER_SESSION.VIEW_TYPE) == ORDER_VIEW.DETAILS
        Template[ORDER_TEMPLATE.DETAILS]()
    else
        Template[ORDER_TEMPLATE.OVERVIEW]()

#--- orders_table template bindings ---#

Template.order_table.rendered = ->
    $(".order-action").tooltip(
        placement: "top"
    )

Template.order_table.tag = ->
    null

Template.order_table.events =
    "mouseenter .order-entry": (evt) ->
        target = evt.target
        order_action = $(target).find(".order-action")
        _.each order_action, (anchor) ->
            $(anchor).removeClass "btn-disabled"
            $(anchor).addClass "btn-primary"

    "mouseleave .order-entry": (evt) ->
        target = evt.target
        order_action = $(target).find(".order-action")
        _.each order_action, (anchor) ->
            $(anchor).removeClass "btn-primary"
            $(anchor).addClass "btn-disabled"

