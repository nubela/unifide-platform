@INVENTORY_SESSION =
    SUBURL: "INVSubUrl"

@INVENTORY_TEMPLATE =
    MAIN: "inventory_all"
    NEW: "inventory_compose"

@INVENTORY_PAGE =
    MAIN: "all"
    COMPOSE: "new"

ITEMS_PER_PAGE = 20

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

Template.inventory_all.rendered = ->
    null

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

#-- helper --#

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

    INVENTORY_TEMPLATE.MAIN

addContainerToInventory = (container_id, cb) ->
    Meteor.call "new_inventory_container", container_id, cb