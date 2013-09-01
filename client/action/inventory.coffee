@INVENTORY_SESSION =
    SUBURL: "INVSubUrl"

@INVENTORY_TEMPLATE =
    MAIN: "inventory_all"
    MONITOR: "inventory_monitor"

@INVENTORY_PAGE =
    MAIN: "all"
    MONITOR: "monitor"

ITEMS_PER_PAGE = 20
DEFAULT_WARNING_QUANTITY = 2
WARNING_QTY_KEY = "ecommerce_warning_quantity"

#-- inventory --#

Template.inventory.rendered = ->
    scrollTop()

Template.inventory.view = ->
    Template[getPage()]()

#-- inventory_all --#

Template.inventory_all.created = ->
    Meteor.subscribe "all_items"
    Meteor.subscribe "all_containers"
    Meteor.subscribe "all_inventory"

Template.inventory_all.events =
    "click #add-container-to-inventory": (evt) ->
        searchContainerId (success, container_id, container_name) ->
            if success
                addContainerToInventory container_id, ->
                    flashAlert("Added #{container_name} to inventory!", "")

    "click [data-expand]": (evt) ->
        elem = $(evt.target).parents("[data-expand]")[0]
        id = $(elem).attr("data-expand")
        $("[data-expanded]").addClass "hidden"
        $("[data-expanded=#{id}]").removeClass("hidden")

    "click .delete-btn": (evt) ->
        inventory_id = $(evt.target).parents("[data-expanded]").attr("data-expanded")
        bootbox.confirm "Confirm remove?", (res) ->
            if res
                Inventory.remove {_id: new Meteor.Collection.ObjectID(inventory_id)}


Template.inventory_all.inventory = ->
    getAllInventory()

Template.inventory_all.has_inventory = ->
    getAllInventory().fetch().length > 0

Template.inventory_all.current_page = ->
    getPageNo()

Template.inventory_all.next_page_url = ->
    page_no = getPageNo()
    next_page = page_no + 1
    return "/inventory/#{next_page}"

Template.inventory_all.prev_page_url = ->
    page_no = getPageNo()
    prev_page = page_no - 1
    return "/inventory/#{prev_page}"

Template.inventory_all.has_next = ->
    total_items = Inventory.find({}).count()
    total_pages = Math.ceil(total_items / ITEMS_PER_PAGE)
    getPageNo() < total_pages

Template.inventory_all.has_prev = ->
    getPageNo() >= 2


#-- inventory_compose --#

Template.inventory_monitor.created = ->
    Meteor.subscribe "all_items"
    Meteor.subscribe "all_containers"
    Meteor.subscribe "all_inventory"

Template.inventory_monitor.events =
    "click #change-warning-qty-btn": (evt) ->
        bootbox.prompt "Alert you when item quantity is equal or below..", (res) ->
            if isNumber res
                setProfileSettings WARNING_QTY_KEY, parseInt(res)

    "click [data-expand]": (evt) ->
        elem = $(evt.target).parents("[data-expand]")[0]
        id = $(elem).attr("data-expand")
        $("[data-expanded]").addClass "hidden"
        $("[data-expanded=#{id}]").removeClass("hidden")

Template.inventory_monitor.has_warning_items = ->
    getWarningItems().length > 0

Template.inventory_monitor.warning_items = ->
    getWarningItems()

Template.inventory_monitor.warning_qtn = ->
    getWarningQty()

#-- helper --#

getWarningItems = ->
    #get inventory and containers
    all_inventory = Inventory.find({}).fetch()
    all_containers = []
    for i in all_inventory
        container = ITMChildCategories.findOne {_id: i.container_id}
        if container?
            child_containers = getChildContainers(container)
            for c in child_containers
                all_containers.push c

    #get item cursor
    child_container_ids = _.map all_containers, (c) -> c._id
    if child_container_ids.length == 0
        return []
    all_items = ITMItems.find {
        container_id:
            $in: child_container_ids
    }, {
        transform: (doc) ->
            doc.container = ITMChildCategories.findOne {_id: doc.container_id}
            doc.container_path = doc.container.materialized_path.join(" / ")
            doc["id"] = doc._id.valueOf()
            doc.view_url = "/items/#{doc.container.materialized_path.join("/")}/item/#{doc.id}"
            doc.update_url = "/items/#{doc.container.materialized_path.join("/")}/update/#{doc.id}"
            doc
    }

    #check for low qty items
    all_items = all_items.fetch()
    warning_qty = getWarningQty()
    warned_items = []
    for i in all_items
        if "quantity" of i and isNumber(i.quantity) and parseInt(i.quantity) <= warning_qty
            warned_items.push i

    warned_items

getWarningQty = ->
    if getProfileSettings(WARNING_QTY_KEY) then getProfileSettings(WARNING_QTY_KEY) else DEFAULT_WARNING_QUANTITY

getAllInventory = ->
    page_no_0_idx = getPageNo() - 1
    Inventory.find {}, {
        limit: ITEMS_PER_PAGE
        skip: page_no_0_idx * ITEMS_PER_PAGE
        sort:
            modification_timestamp_utc: -1
        transform: (doc) ->
            doc["id"] = doc._id.valueOf()
            doc["container"] = ITMChildCategories.findOne {_id: doc.container_id}
            doc["container_full_path"] = doc.container.materialized_path.join " / "

            all_child_containers = getChildContainers doc.container
            child_container_ids = _.map all_child_containers, (c) ->
                c._id
            all_items = ITMItems.find
                container_id:
                    $in: child_container_ids
            doc["item_count"] = all_items.count()

            doc
    }

getChildContainers = (container) ->
    all_containers = [container]
    res = ITMChildCategories.find
        parent_id: container._id
    all_res = res.fetch()
    for r in all_res
        all_children = getChildContainers(r)
        for cr in all_children
            all_containers.push cr
    all_containers


getPageNo = ->
    slugs = Session.get INVENTORY_SESSION.SUBURL
    if not slugs?
        return 1

    slugs = slugs.split("/")
    slugs = _.filter slugs, (s) ->
        s != ""
    if slugs.length >= 1
        return parseInt slugs[0]
    return 1

getMonitorPageNo = ->
    slugs = Session.get INVENTORY_SESSION.SUBURL
    if not slugs?
        return 1

    slugs = slugs.split("/")
    slugs = _.filter slugs, (s) ->
        s != ""
    if slugs.length >= 2
        return parseInt slugs[1]
    return 1

getPage = () ->
    slugs = Session.get INVENTORY_SESSION.SUBURL
    if not slugs?
        return INVENTORY_TEMPLATE.MAIN

    slugs = slugs.split("/")
    slugs = _.filter slugs, (s) ->
        s != ""
    if slugs.length >= 1
        if slugs[0] == INVENTORY_PAGE.COMPOSE
            return INVENTORY_TEMPLATE.NEW
        else if slugs[0] == INVENTORY_PAGE.MONITOR
            return INVENTORY_TEMPLATE.MONITOR

    INVENTORY_TEMPLATE.MAIN

addContainerToInventory = (container_id, cb) ->
    Meteor.call "new_inventory_container", container_id, cb