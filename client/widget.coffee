LIMIT_LENGTH = 8
SEARCH_ITEM_CALLBACK = null
SEARCH_CONTAINER_CALLBACK = null
WIDGET_SESSION =
    ITEM_KEYWORD: "WItemKeyword"
    CONTAINER_KEYWORD: "WContainerKeyword"

#-- search_item_widget --#

Template.search_item_widget.rendered = ->
    $(".select-item").on "click", ->
        cb = SEARCH_ITEM_CALLBACK
        if cb?
            cb true, $(this).attr("data-item-id"), $(this).attr("data-item-name")
        $("#search-item-modal").modal("hide")

Template.search_item_widget.has_results = ->
    kw = Session.get WIDGET_SESSION.ITEM_KEYWORD
    if kw?
        return ITMItems.find({
            $or: [{
                name:
                    {$regex: ".*#{kw}.*", $options: 'i'}},
                {description:
                    {$regex: ".*#{kw}.*", $options: 'i'}}
            ]
        }, {limit: LIMIT_LENGTH}).fetch().length > 0
    false

Template.search_item_widget.results = ->
    kw = Session.get WIDGET_SESSION.ITEM_KEYWORD
    if kw?
        return ITMItems.find {
            $or: [{
                name:
                    {$regex: ".*#{kw}.*", $options: 'i'}},
                {description:
                    {$regex: ".*#{kw}.*", $options: 'i'}}
            ]
        }, {
            limit: LIMIT_LENGTH
            transform: (doc) ->
                doc.path_lis = getItemContainerPathLis(doc).join(" / ")
                doc.id_str = doc._id.valueOf()
                doc
        }

#-- search_container_widget --#

Template.search_container_widget.rendered = ->
    $(".select-container").on "click", ->
        cb = SEARCH_CONTAINER_CALLBACK
        if cb?
            console.log true, $(this).attr("data-container-id"), $(this).attr("data-container-name")
            cb true, $(this).attr("data-container-id"), $(this).attr("data-container-name")
        $("#search-container-modal").modal("hide")

Template.search_container_widget.has_results = ->
    kw = Session.get WIDGET_SESSION.CONTAINER_KEYWORD
    if kw?
        return ITMChildCategories.find({
            $or: [{
                name:
                    {$regex: ".*#{kw}.*", $options: 'i'}},
                {description:
                    {$regex: ".*#{kw}.*", $options: 'i'}}
            ]
        },
            {limit: LIMIT_LENGTH}
        ).fetch().length > 0
    false

Template.search_container_widget.results = ->
    kw = Session.get WIDGET_SESSION.CONTAINER_KEYWORD
    if kw?
        return ITMChildCategories.find {
            $or: [{
                name:
                    {$regex: ".*#{kw}.*", $options: 'i'}},
                {description:
                    {$regex: ".*#{kw}.*", $options: 'i'}}
            ]
        }, {
            limit: LIMIT_LENGTH
            transform: (doc) ->
                doc.path_lis = doc.materialized_path.join(" / ")
                doc.id_str = doc._id.valueOf()
                doc
        }

#util methods below

@searchItemId = (cb) ->
    """
    Opens the search item widget for the user to search for a specific item,
    with a callback that takes in 3 arguments, specifically: (success, item_id, item_name)
    """
    #reset variable and resubscribe
    Session.set WIDGET_SESSION.ITEM_KEYWORD, null
    SEARCH_ITEM_CALLBACK = cb
    Meteor.subscribe "all_containers"
    Meteor.subscribe "all_items"

    #lets make modal bindings
    $("#search-item-modal").on "shown", ->
        $("#item-search-keyword").focus()
        $("#item-search-keyword").on "change paste keyup", ->
            kw = $.trim $(this).val()
            if kw?
                Session.set WIDGET_SESSION.ITEM_KEYWORD, kw
    $("#search-item-widget-close-btn").click ->
        if cb?
            cb(false)
        $("#search-item-modal").modal("hide")

    #show modal
    $("#search-item-modal").modal
        backdrop: "static"


@searchContainerId = (cb) ->
    """
    Opens the container search widget for the user to search for a specific container,
    with a callback that takes in 3 arguments, specifically: (success, container_id, container_name)
    """
    #reset variable and resubscribe
    Session.set WIDGET_SESSION.CONTAINER_KEYWORD, null
    SEARCH_CONTAINER_CALLBACK = cb
    Meteor.subscribe "all_containers"

    #lets make modal bindings
    $("#search-container-modal").on "shown", ->
        $("#container-search-keyword").focus()
        $("#container-search-keyword").on "change paste keyup", ->
            kw = $.trim $(this).val()
            if kw?
                Session.set WIDGET_SESSION.CONTAINER_KEYWORD, kw

    $("#search-container-widget-close-btn").click ->
        if cb?
            cb(false)
        $("#search-container-modal").modal("hide")

    #show modal
    $("#search-container-modal").modal
        backdrop: "static"


getItemContainerPathLis = (item_doc) ->
    ###
    Returns the path lis of an item
    ###
    container_obj = ITMChildCategories.findOne({_id: item_doc.container_id})
    container_obj.materialized_path
