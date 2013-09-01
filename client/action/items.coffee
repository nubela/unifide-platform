#------ ENUMS ------#

@ITEM_SESSION =
    CONTAINER: "ITMContainer"
    CONTAINER_DESC: "ITMContainerDesc"
    MATERIALIZED_PATH: "ITMMaterializedPath"
    VIEW_TYPE: "ITMViewType"
    SUBURL: "ITMSubUrl"
    ITEM_ID: "ITMItemId"
    CUSTOM_ATTRS: "ITMCustomAttr"
    CUSTOM_MEDIA: "ITMCustomImg"
    CUSTOM_TAGS: "ITMCustomTags"
    SORT_METHOD: "ITMSortMethod"


VIEW_TYPE =
    CONTAINER: "ITM_VT_Container"
    ITEM: "ITM_VT_Item"
    CREATE: "ITM_VT_Create"
    UPDATE: "ITM_VT_Update"
    CREATE_BASED: "ITM_VT_CREATE_BASED"


ITEM_TEMPLATE =
    BASE: "items"
    SELECT_CONTAINER: "select-container"
    ITEMS: "item_container"
    COMPOSE: "item_compose"
    ITEM_VIEW: "item_view"


ITEM_RESERVED_KEYWORDS = ["new", "item", "update", "based"]

ITEM_SORT_METHOD =
    DATE_ADDED: "date_added"
    NAME: "name"


#------ helper functions ------#

filterForSimilarItems = (all_items) ->
    """
    Takes a list of items, and remove similar items from the mix, leaving the "base" item in it, while adding
    an attribute to signify that it has multiple "similar" items.
    """
    dic =
        _legacy: []

    #sort items by group_ids
    for i in all_items
        if not "group_id" of i
            dic["_legacy"].push i
        else
            if not dic[i.group_id]?
                dic[i.group_id] = []
            dic[i.group_id].push i

    filtered_items = []
    for k,v of dic
        if k != "_legacy"
            if v.length > 1
                #ok found similar items! lets sort it
                sorted_v = (_.sortBy v, (itm) -> itm.timestamp_utc)
                picked_item = sorted_v[0]
                picked_item.is_multi = true
            else
                picked_item = v[0]
                picked_item.is_multi = false

            filtered_items.push picked_item

        else
            filtered_items = filtered_items.concat v

    return filtered_items





url_from_path = (path_lis) ->
    url = "/items"
    if path_lis?
        _.each path_lis, (component) ->
            url = url + "/" + component
    return url


suburl_to_current_path_for_items = ->
    path_lis = Session.get(ITEM_SESSION.MATERIALIZED_PATH)
    url_from_path(path_lis)


is_materialized_path_null = ->
    return Session.get(ITEM_SESSION.MATERIALIZED_PATH) == null


rehash_container_items = ->
    path_lis = Session.get(ITEM_SESSION.MATERIALIZED_PATH)
    Meteor.subscribe "container_item_media", path_lis
    Meteor.subscribe "child_containers", path_lis
    Meteor.subscribe "container_items", path_lis


is_view_type = (view_type) ->
    Session.get(ITEM_SESSION.VIEW_TYPE) == view_type


init_items = ->
    #defaults
    Session.set(ITEM_SESSION.CONTAINER, null)
    Session.set(ITEM_SESSION.MATERIALIZED_PATH, null)
    Session.set(ITEM_SESSION.VIEW_TYPE, VIEW_TYPE.CONTAINER)
    Session.set(ITEM_SESSION.SORT_METHOD, ITEM_SORT_METHOD.DATE_ADDED)
    Session.set(ITEM_SESSION.CUSTOM_ATTRS, [])
    Session.set(ITEM_SESSION.CUSTOM_MEDIA, [])
    Session.set(ITEM_SESSION.CUSTOM_TAGS, [])

    #now lets overwrite the defaults
    path_lis_str = Session.get(ITEM_SESSION.SUBURL)
    if path_lis_str?
        path_lis_str = decodeURIComponent(path_lis_str)
        path_lis = path_lis_str.split("/")
        Session.set(ITEM_SESSION.MATERIALIZED_PATH, path_lis)

    #view type and special keywords
    if path_lis_str?
        keyword = path_lis.pop()

        #first keyword
        if _.contains(ITEM_RESERVED_KEYWORDS, keyword)
            Session.set(ITEM_SESSION.MATERIALIZED_PATH, path_lis.slice(0, path_lis.length))
            if keyword == "new"
                Session.set(ITEM_SESSION.VIEW_TYPE, VIEW_TYPE.CREATE)

        keyword2 = path_lis.pop()
        if _.contains(ITEM_RESERVED_KEYWORDS, keyword2)
            Session.set(ITEM_SESSION.MATERIALIZED_PATH, path_lis.slice(0, path_lis.length))
            if keyword2 == "item"
                Session.set(ITEM_SESSION.ITEM_ID, keyword)
                Session.set(ITEM_SESSION.VIEW_TYPE, VIEW_TYPE.ITEM)
            else if keyword2 == "update"
                Session.set(ITEM_SESSION.ITEM_ID, keyword)
                Session.set(ITEM_SESSION.VIEW_TYPE, VIEW_TYPE.UPDATE)
            else if keyword2 == "based"
                Session.set(ITEM_SESSION.ITEM_ID, keyword)
                Session.set(ITEM_SESSION.VIEW_TYPE, VIEW_TYPE.CREATE_BASED)

    rehash_container_items()

createItem = ->
    all_file_input_load_status = {}
    submitItemCreation = ->
        data = {}
        for obj in data_lis
            data[obj.name] = obj.value
        alert = newAlert("Creating..", "Your item is being uploaded, please hold on and do not refresh the page.", false)
        Meteor.call "create_item", data, ->
            $(alert).remove()
            new_alert = newAlert("Item created!", "Your item will appear momentarily.", true)
            setTimeout (->
                $(new_alert).remove()
            ), 4000

    fileReaderOnLoad = (e, name_attr) ->
        base64_encoded_data = e.target.result.match(/,(.*)$/)[1]
        data_lis.push {name: name_attr, value: base64_encoded_data}
        all_file_input_load_status[name_attr] = true
        for k,v of all_file_input_load_status
            if not v
                return
        submitItemCreation()

    data_lis = $("#item-compose-form").serializeArray()

    all_file_input = $("input[type=file]")
    for f in all_file_input
        if f.files and f.files[0]
            all_file_input_load_status[$(f).attr("name")] = false
    if Object.keys(all_file_input_load_status).length == 0
        submitItemCreation()

    for i in [0..all_file_input.length-1]
        ((idx) ->
            file_input = all_file_input[idx]
            if file_input.files and file_input.files[0]
                file_reader = new FileReader()
                file_reader.onload = (e) ->
                    fileReaderOnLoad(e, $(file_input).attr("name"))
                file_reader.readAsDataURL file_input.files[0]
        )(i)


#------ item template functions ------#

Template.items.child_containers = ->
    container_path_lis = if Session.get(ITEM_SESSION.MATERIALIZED_PATH) then Session.get(ITEM_SESSION.MATERIALIZED_PATH) else []

    main_container = ITMChildCategories.findOne
        materialized_path: container_path_lis
    if not main_container? and container_path_lis.length != 0
        return ITMChildCategories.find {}, limit: 0

    ITMChildCategories.find {
        parent_id: if container_path_lis.length != 0 then main_container._id else null}, {
        transform: (doc) ->
            url = suburl_to_current_path_for_items()
            doc.url = url + "/" + doc.name
            doc.id = doc._id.valueOf()
            doc
        sort: {name: 1}
    }

Template.items.is_root_container = ->
    is_materialized_path_null()


Template.items.materialized_path = ->
    Session.get(ITEM_SESSION.MATERIALIZED_PATH)


Template.items.view = ->
    if Session.get(ITEM_SESSION.VIEW_TYPE) == VIEW_TYPE.CONTAINER
        if is_materialized_path_null()
            return Template[ITEM_TEMPLATE.SELECT_CONTAINER]()
        else
            return Template[ITEM_TEMPLATE.ITEMS]()

    else if Session.get(ITEM_SESSION.VIEW_TYPE) == VIEW_TYPE.CREATE or Session.get(ITEM_SESSION.VIEW_TYPE) == VIEW_TYPE.UPDATE or Session.get(ITEM_SESSION.VIEW_TYPE) == VIEW_TYPE.CREATE_BASED
        return Template[ITEM_TEMPLATE.COMPOSE]()

    else if Session.get(ITEM_SESSION.VIEW_TYPE) == VIEW_TYPE.ITEM
        return Template[ITEM_TEMPLATE.ITEM_VIEW]()


Template.items.back_url = ->
    if Session.get(ITEM_SESSION.VIEW_TYPE) == VIEW_TYPE.ITEM
        return suburl_to_current_path_for_items()

    else if Session.get(ITEM_SESSION.VIEW_TYPE) == VIEW_TYPE.CREATE
        return suburl_to_current_path_for_items()
    else
        path_lis = Session.get(ITEM_SESSION.MATERIALIZED_PATH)
        path_lis_len = path_lis.length
        if not path_lis?
            return "#"

            #revert to root container
        else if path_lis_len == 1
            return "/items"

        back_path_lis = path_lis.splice(0, path_lis_len - 1)
        return url_from_path(back_path_lis)

Template.items.events =
    "click .new_container": (evt) ->
        bootbox.prompt "Name of container to create?", (container_name) ->
            if not container_name?
                return

            bootbox.prompt "Description of " + container_name + "?", (container_desc) ->
                path_lis = Session.get(ITEM_SESSION.MATERIALIZED_PATH)
                if path_lis
                    path_lis.push(container_name)
                else
                    path_lis = [container_name]

                Meteor.call "put_container", path_lis, container_desc, ->
                    init_items()


Template.items.rendered = ->
    scrollTop()
    pressTimer = null
    $(".anchor-container").mouseup(((evt) ->
        clearTimeout(pressTimer)
    )).mousedown((evt) ->
        pressTimer = window.setTimeout((->
            evt.preventDefault()
            bootbox.confirm "Delete container?", (res) ->
                if res
                    anchor = $(evt.target).parent()
                    container_id = $(anchor).attr("id")
                    Meteor.call "del_container", container_id
                    $(anchor).remove()

        ), 1000))


#------ item-container compose functions ------#

Template.item_compose.tags_json = ->
    if Session.get(ITEM_SESSION.VIEW_TYPE) == VIEW_TYPE.UPDATE
        item_id = Session.get(ITEM_SESSION.ITEM_ID)
        obj = ITMItems.findOne({$or: [
            {_id: new Meteor.Collection.ObjectID(item_id)},
            {_id: item_id}
        ]})
        if obj?
            Session.set(ITEM_SESSION.CUSTOM_TAGS, obj.tags)
            return JSON.stringify(obj.tags)

    return JSON.stringify([])


Template.item_compose.group_items = ->
    item_id = Session.get(ITEM_SESSION.ITEM_ID)

    actual_item = ITMItems.findOne({$or: [
        {_id: new Meteor.Collection.ObjectID(item_id)},
        {_id: item_id}
    ]})

    if not actual_item?
        return []
    if not "group_id" of actual_item
        return []

    ITMItems.find({
        group_id: actual_item.group_id
    }, {

        sort: {timestamp_utc: 1}
        transform: (doc) ->
            doc["is_active"] = item_id == doc._id.valueOf()
            doc["item_url"] = suburl_to_current_path_for_items() + "/update/" + doc._id.valueOf()
            doc
    })


Template.item_compose.custom_media_lis_json = ->
    if Session.get(ITEM_SESSION.VIEW_TYPE) == VIEW_TYPE.UPDATE
        item_id = Session.get(ITEM_SESSION.ITEM_ID)
        obj = ITMItems.findOne({$or: [
            {_id: new Meteor.Collection.ObjectID(item_id)},
            {_id: item_id}
        ]})
        if obj?
            Session.set ITEM_SESSION.CUSTOM_MEDIA, obj.custom_media_lis
            return JSON.stringify(obj.custom_media_lis)
    return JSON.stringify([])


Template.item_compose.custom_attr_lis_json = ->
    if Session.get(ITEM_SESSION.VIEW_TYPE) == VIEW_TYPE.UPDATE
        item_id = Session.get(ITEM_SESSION.ITEM_ID)
        obj = ITMItems.findOne({$or: [
            {_id: new Meteor.Collection.ObjectID(item_id)},
            {_id: item_id}
        ]})
        if obj?
            Session.set(ITEM_SESSION.CUSTOM_ATTRS, obj.custom_attr_lis)
            return JSON.stringify(obj.custom_attr_lis)

    return JSON.stringify([])


Template.item_compose.extra_attr = ->
    if Session.get(ITEM_SESSION.VIEW_TYPE) == VIEW_TYPE.UPDATE
        lis = []
        item_id = Session.get(ITEM_SESSION.ITEM_ID)
        obj = ITMItems.findOne({$or: [
            {_id: new Meteor.Collection.ObjectID(item_id)},
            {_id: item_id}
        ]})
        if obj?
            _.each obj.custom_attr_lis, (attr) ->
                lis.push
                    k: attr,
                    v: obj[attr]

            return lis
    null


Template.item_compose.item_to_update = ->
    if Session.get(ITEM_SESSION.VIEW_TYPE) == VIEW_TYPE.UPDATE or Session.get(ITEM_SESSION.VIEW_TYPE) == VIEW_TYPE.CREATE_BASED
        item_id = Session.get(ITEM_SESSION.ITEM_ID)
        return ITMItems.findOne({$or: [
            {_id: new Meteor.Collection.ObjectID(item_id)},
            {_id: item_id}
        ]}, {
            transform: (doc) ->
                doc.id = doc._id.valueOf()
                doc
        })
    return null


Template.item_compose.to_be_based = ->
    Session.get(ITEM_SESSION.VIEW_TYPE) == VIEW_TYPE.CREATE_BASED

Template.item_compose.created = ->
    scrollTop()

Template.item_compose.rendered = ->
    $("#tagsinput_tag").keypress (e) ->
        if e.which == 13
            e.preventDefault()

            #get tag val
            val = $(this).val()
            if not val?
                return

            #add to list and input
            customtagLis = Session.get(ITEM_SESSION.CUSTOM_TAGS)
            if not _.contains(customtagLis, val)
                customtagLis.push(val)

            Session.set ITEM_SESSION.CUSTOM_TAGS, customtagLis
            $("#custom-tag-lis").attr("value", JSON.stringify(customtagLis))

            #add to ui
            random_id = Math.random().toString(36).substr(2, 16)
            custom_grp = $("#tag-template").clone().removeAttr("id").removeClass("hidden")
            custom_grp.find("span").text(val)
            $("#tagsinput").prepend(custom_grp)

            #remove focus and text
            $(this).val("")
            $(this).blur()


Template.item_compose.events =
    'click .submit-btn': (evt) ->
        evt.preventDefault()
        if $("#item-compose-form").parsley("validate")
            createItem()
            url = suburl_to_current_path_for_items()
            Router.navigate(url, true)

        $("#custom-attr-lis").attr("value", "")


    'click #add-custom-attr-btn': (evt) ->
        bootbox.prompt "Attribute name without spaces? (Example: \"price_in_euro\")", (attr_name) ->
            if not attr_name?
                return

            #add custom attr name
            customAttrLis = Session.get(ITEM_SESSION.CUSTOM_ATTRS)
            if not _.contains(customAttrLis, attr_name)
                customAttrLis.push(attr_name)

            Session.set(ITEM_SESSION.CUSTOM_ATTRS, customAttrLis)
            $("#custom-attr-lis").attr("value", JSON.stringify(customAttrLis))

            #add control group
            random_id = Math.random().toString(36).substr(2, 16)
            custom_grp = $("#custom-attr-template").clone().removeAttr("id").removeClass("hidden")
            custom_grp.find("label").attr("for", random_id).text(attr_name)
            custom_grp.find("input").attr("id", random_id).attr("name", attr_name)
            $("#custom-ctrl-grp").before(custom_grp)


    'click #add-custom-img-btn': (evt) ->
        bootbox.prompt "Media attribute name without spaces? (Example: \"color\")", (attr_name) ->
            if not attr_name?
                return

            #add custom attr name
            customImgLis = Session.get(ITEM_SESSION.CUSTOM_MEDIA)
            if not _.contains(customImgLis, attr_name)
                customImgLis.push(attr_name)

            Session.set(ITEM_SESSION.CUSTOM_MEDIA, customImgLis)
            $("#custom-img-lis").attr("value", JSON.stringify(customImgLis))

            #add control group
            random_id = Math.random().toString(36).substr(2, 16)
            custom_grp = $("#custom-img-template").clone().removeAttr("id", random_id).removeClass("hidden")
            custom_grp.find("label").attr("for", random_id).text(attr_name)
            custom_grp.find("input").attr("id", random_id).attr("name", attr_name)
            $("#custom-ctrl-grp").before(custom_grp)


    'click #tagsinput_addTag': (evt) ->
        $("#tagsinput_tag").focus()


    'click .tagsinput-remove-link': (evt) ->
        bootbox.confirm "Confirm remove tag?", (res) ->
            if res?
                #remove from list
                tag_name = $(evt.target).parent().find("span").text()
                customtagLis = Session.get(ITEM_SESSION.CUSTOM_TAGS)
                customtagLis = _.without(customtagLis, tag_name)
                Session.set(ITEM_SESSION.CUSTOM_TAGS, customtagLis)
                $("#custom-tag-lis").attr("value", JSON.stringify(customtagLis))

                #remove from ui
                $(evt.target).parent().remove()


Template.item_compose.back_url = suburl_to_current_path_for_items()


Template.item_compose.form_submit_url = ->
    return BACKEND_URL + "item/"


Template.item_compose.path_lis_json = ->
    path_lis = Session.get(ITEM_SESSION.MATERIALIZED_PATH)
    return JSON.stringify(path_lis)


Template.item_compose.redirect_to = ->
    suburl = suburl_to_current_path_for_items()
    return PLATFORM_URL + suburl.substring(1, suburl.length)


#------ item_breadcrumb template functions ------#

Template.item_breadcrumb.breadcrumbs = ->
    lis = Session.get(ITEM_SESSION.MATERIALIZED_PATH)
    array_lis = []
    for i in [0..lis.length - 1]
        itm = lis[i]
        sub_lis = lis.slice(0, i + 1)
        array_lis.push
            name: itm,
            url: url_from_path(sub_lis)

    return array_lis


Template.item_breadcrumb.active = ->
    if is_view_type(VIEW_TYPE.CONTAINER)
        return "All"
    else if is_view_type(VIEW_TYPE.CREATE)
        return "New Item"
    else if is_view_type(VIEW_TYPE.ITEM)
        return "View Item"

#------ item_view template functions ------/#

Template.item_view.rendered = ->
    $("[data-toggle='tooltip']").tooltip
        placement: "left"

Template.item_view.update_url = ->
    url = suburl_to_current_path_for_items()
    item_id = Session.get(ITEM_SESSION.ITEM_ID)
    url + "/update/" + item_id

Template.item_view.created_base_url = ->
    url = suburl_to_current_path_for_items()
    item_id = Session.get(ITEM_SESSION.ITEM_ID)
    url + "/based/" + item_id

Template.item_view.item = ->
    item_id = Session.get(ITEM_SESSION.ITEM_ID)
    ITMItems.findOne({$or: [
        {_id: new Meteor.Collection.ObjectID(item_id)},
        {_id: item_id}
    ]}, {
        transform: (doc) ->
            if doc.media_id?
                media_obj = ITMMedia.findOne({_id: doc.media_id})
                if media_obj?
                    doc.media_url = url_for(media_obj)
            doc
    })

Template.item_view.group_items = ->
    item_id = Session.get(ITEM_SESSION.ITEM_ID)

    actual_item = ITMItems.findOne({$or: [
        {_id: new Meteor.Collection.ObjectID(item_id)},
        {_id: item_id}
    ]})

    if not actual_item?
        return []
    if not "group_id" of actual_item
        return []

    ITMItems.find({
        group_id: actual_item.group_id
    }, {

        sort: {timestamp_utc: 1}
        transform: (doc) ->
            doc["is_active"] = item_id == doc._id.valueOf()
            doc["item_url"] = suburl_to_current_path_for_items() + "/item/" + doc._id.valueOf()
            doc
    })


Template.item_view.events =
    "click #delete-item": ->
        bootbox.confirm "Confirm delete?", (res) ->
            if res
                item_id = Session.get(ITEM_SESSION.ITEM_ID)
                url = suburl_to_current_path_for_items()
                Meteor.call "del_item", item_id, (error, content) ->
                    Router.navigate(url, true)
                ITMItems.remove({_id: item_id})

#------ item_container template functions ------#

Template.item_container.events =
    "click .sort_by_date": ->
        Session.set(ITEM_SESSION.SORT_METHOD, ITEM_SORT_METHOD.DATE_ADDED)

    "click .sort_by_name": ->
        Session.set(ITEM_SESSION.SORT_METHOD, ITEM_SORT_METHOD.NAME)


Template.item_container.rendered = ->
    scrollTop()
    width = $(".empty-img").width()
    $(".empty-img").height(width)
    $(".empty-img").css("line-height", width + "px")
    _.each $(".items .item .img-holder"), (itm) ->
        $(itm).height(width)


Template.item_container.container_name = ->
    container_obj = Session.get(ITEM_SESSION.CONTAINER)
    if not container_obj?
        path_lis = Session.get(ITEM_SESSION.MATERIALIZED_PATH)
        return path_lis.pop()

    return container_obj.name


Template.item_container.desc = ->
    Session.get(ITEM_SESSION.CONTAINER_DESC)


Template.item_container.total_items = ->
    container_path_lis = if Session.get(ITEM_SESSION.MATERIALIZED_PATH) then Session.get(ITEM_SESSION.MATERIALIZED_PATH) else []
    main_container = ITMChildCategories.findOne
        materialized_path: container_path_lis

    if container_path_lis.length != 0 and not main_container?
        return ITMItems.find({}, limit: 0).count()

    ITMItems.find({container_id: main_container._id}).count()


Template.item_container.sort_by_date = ->
    Session.get(ITEM_SESSION.SORT_METHOD) == ITEM_SORT_METHOD.DATE_ADDED


Template.item_container.sort_by_name = ->
    Session.get(ITEM_SESSION.SORT_METHOD) == ITEM_SORT_METHOD.NAME


Template.item_container.items = ->
    container_path_lis = if Session.get(ITEM_SESSION.MATERIALIZED_PATH) then Session.get(ITEM_SESSION.MATERIALIZED_PATH) else []
    main_container = ITMChildCategories.findOne
        materialized_path: container_path_lis

    #check that container exists, if not, return empty result
    if container_path_lis.length != 0 and not main_container?
        return ITMItems.find({}, limit: 0)

    all_items = ITMItems.find({container_id: main_container._id}, {
        sort: {timestamp_utc: 1}
        transform: (doc) ->
            if doc.media_id?
                media_obj = ITMMedia.findOne({_id: doc.media_id})
                if media_obj?
                    doc.media_url = url_for(media_obj)
            doc
    }).fetch()

    all_items = filterForSimilarItems(all_items)

    item_lis = [
        is_empty: true
    ]

    #push all populated items into items_obj
    _.each all_items, (itm) ->
        itm.item_url = suburl_to_current_path_for_items() + "/item/" + itm._id
        item_lis.push(itm)

    #split items obj list into sublists of 5
    split_lis = []
    sub_lis = {individual_item: []}
    i = 0
    j = 5
    _.each item_lis, (itm) ->
        sub_lis.individual_item.push(itm)
        if i % j == 0 and i > 0
            split_lis.push(sub_lis)
            sub_lis = {individual_item: []}
            j = 6
            i = 0
        i++

    if sub_lis.individual_item.length > 0
        split_lis.push(sub_lis)

    split_lis


Template.item_container.new_item_url = ->
    url = suburl_to_current_path_for_items()
    url + "/new"


@_init_items = init_items