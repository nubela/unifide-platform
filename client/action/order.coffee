@ORDER_VIEW =
    UPDATE: "order_view_update"
    OVERVIEW: "order_view_overview"
    DETAILS: "order_view_details"
    DETAILS_FILTERED: "order_view_details_filtered"

@ORDER_SESSION =
    OBJ_ID: "order_obj_id"
    VIEW_TYPE: "order_view_type"
    PAGE_NO: "order_page_no"

@ORDER_TEMPLATE =
    OVERVIEW: "order_table"
    UPDATE: "order_update"
    DETAILS: "order_details"

ORDERS_PAGE_PAGE = 10

Template.order.view = ->
    if (Session.get ORDER_SESSION.VIEW_TYPE) == ORDER_VIEW.UPDATE
        Template[ORDER_TEMPLATE.UPDATE]()
    else if (Session.get ORDER_SESSION.VIEW_TYPE) == ORDER_VIEW.DETAILS
        Template[ORDER_TEMPLATE.DETAILS]()
    else
        Template[ORDER_TEMPLATE.OVERVIEW]()

#--- orders_table template bindings ---#

Template.order_table.has_orders = ->
    ORDERObj.find(cursorFilter()).count() > 0

Template.order_table.has_orders = ->
    ORDERObj.find(cursorFilter()).count() > 0

Template.order_table.total_orders = ->
    ORDERObj.find(cursorFilter()).count()

Template.order_table.current_orders = ->
    (parseInt(Session.get ORDER_SESSION.PAGE_NO) - 1) * ORDERS_PAGE_PAGE

Template.order_table.max_orders = ->
    skip = (parseInt(Session.get ORDER_SESSION.PAGE_NO) - 1) * ORDERS_PAGE_PAGE
    l = ORDERObj.find(cursorFilter(), {limit: ORDERS_PAGE_PAGE}).fetch().length
    skip + l

Template.order_table.has_pagination = ->
    ORDERObj.find(cursorFilter(), {limit: ORDERS_PAGE_PAGE}).fetch().length < ORDERObj.find(cursorFilter()).count()

Template.order_table.is_filtered = ->
    isFilter()

Template.order_table.filtered_item_name = ->
    item = ORDERObj.findOne(cursorFilter())
    item.object.name

Template.order_table.pagination = ->
    total_pages = ORDERObj.find(cursorFilter()).count() / ORDERS_PAGE_PAGE
    pages = []
    current_page = (parseInt Session.get ORDER_SESSION.PAGE_NO)
    next_page = current_page + 1
    prev_page = current_page - 1
    has_next = current_page < total_pages
    has_prev = current_page > 1
    obj_id = Session.get ORDER_SESSION.OBJ_ID
    if total_pages <= 5
        cap = total_pages + 1
    else cap = 6
    _.each _.range(1, cap), (page_no) ->
        pages.push
            url: "/"
            page_no: page_no
            is_active: (parseInt Session.get ORDER_SESSION.PAGE_NO) == page_no
    dic =
        next:
            has: has_next
            url: "/order/filtered/#{ obj_id }/page/#{ next_page }"
        prev:
            has: has_prev
            url: "/order/filtered/#{ obj_id }/page/#{ prev_page }"
        pages: pages
    dic

Template.order_table.orders = ->
    orders = ORDERObj.find(cursorFilter(), cursurOpt()).fetch()
    formatted_lis = []
    _.each orders, (order) ->
        formatted_lis.push
            id: order._id
            date: capitaliseFirstLetter(humanize.naturalDay(order.timestamp_utc))
            user_name: order.user.first_name + " " + order.user.last_name
            item_name: order.object.name
            obj_id: order.obj_id
            status: order.status
    formatted_lis


Template.order_table.rendered = ->
    $(".order-action").tooltip(
        placement: "top"
    )

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

#--- table_row template methods---#

Template.order_details.order_info = ->
    obj_id = Session.get ORDER_SESSION.OBJ_ID
    item = ORDERObj.findOne({_id: obj_id})
    if item
        {
        id: item._id
        status: item.status
        obj_name: item.object.name
        readable_date: humanize.date("l, jS F Y h:i:s A", item.timestamp_utc)
        user_name: item.user.first_name + " " + item.user.last_name
        quantity: item.quantity
        special_notes: item.special_notes
        public_note: item.status_public_notes
        private_note: item.status_private_notes
        }
    else {}

Template.order_details.user_info = ->
    obj_id = Session.get ORDER_SESSION.OBJ_ID
    item = ORDERObj.findOne({_id: obj_id})
    if item
        dic = []
        dic.push
            key: "ID",
            value: item.user._id
        dic.push
            key: "First Name",
            value: item.user.first_name
        dic.push
            key: "Last Name",
            value: item.user.last_name
        dic.push
            key: "Middle Name",
            value: item.user.middle_name
        dic.push
            key: "Email",
            value: item.user.email
        dic.push
            key: "Address",
            value: item.user.address
        dic
    else []

#--- order_update template methods ---#

Template.order_update.submit_url = ->
    backend_url = BACKEND_URL
    return "#{ backend_url }order/status/"

Template.order_update.events =
    "click .checkbox": (evt) ->
        target = evt.target
        $(target).toggleClass "checked"

Template.order_update.order_id = ->
    Session.get ORDER_SESSION.OBJ_ID

Template.order_update.current = ->
    obj_id = Session.get ORDER_SESSION.OBJ_ID
    item = ORDERObj.findOne({_id: obj_id})
    if item
        dic = {
            status: item.status
            private_note: item.status_private_notes
            public_note: item.status_private_notes
        }
        console.log dic
        dic
    else {}

Template.order_update.redirect_url = ->
    obj_id = Session.get ORDER_SESSION.OBJ_ID
    platform_url = PLATFORM_URL
    "#{ platform_url }order/details/#{ obj_id }"

#--- util ---#

capitaliseFirstLetter = (string) ->
    string.charAt(0).toUpperCase() + (string.slice 1)

isFilter = ->
    (Session.get ORDER_SESSION.OBJ_ID) != "null" && (Session.get ORDER_SESSION.OBJ_ID) != null

cursorFilter = ->
    if (Session.get ORDER_SESSION.OBJ_ID) != "null" && (Session.get ORDER_SESSION.OBJ_ID) != null
        dic =
            obj_id: Session.get ORDER_SESSION.OBJ_ID
    else dic = {}
    dic

cursurOpt = ->
    {
    limit: ORDERS_PAGE_PAGE
    skip: (parseInt(Session.get ORDER_SESSION.PAGE_NO) - 1) * ORDERS_PAGE_PAGE
    }

@reset_orders = ->
    Session.set ORDER_SESSION.PAGE_NO, 1
    Session.set ORDER_SESSION.OBJ_ID, null
    Session.set ORDER_SESSION.VIEW_TYPE, ORDER_VIEW.OVERVIEW

@init_orders = ->
    Meteor.call "get_all_orders", (error, content) ->
        _.each content.orders, (order) ->
            ORDERObj.insert(order)