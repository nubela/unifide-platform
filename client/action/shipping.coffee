@SHIPPING_SESSION =
    SUBURL: "SHIPPINGSubUrl"

@SHIPPING_TEMPLATE =
    MAIN: "shipping_all"
    NEW: "shipping_compose"

@SHIPPING_PAGE =
    MAIN: "all"
    COMPOSE: "new"

ITEMS_PER_PAGE = 20

#-- shipping --#

Template.shipping.rendered = ->
    scrollTop()

Template.shipping.view = ->
    Template[getPage()]()

#-- shipping_all --#

Template.shipping_all.created = ->
    Meteor.subscribe "all_admin"
    Meteor.subscribe "all_shipping"

Template.shipping_all.all_methods = ->
    page_no_0_idx = getPageNo() - 1
    ShippingRule.find {}, {
        limit: ITEMS_PER_PAGE
        skip: page_no_0_idx * ITEMS_PER_PAGE
        sort:
            modification_timestamp_utc: -1
        transform: (doc) ->
            doc["id"] = doc._id.valueOf()
            doc["admin"] = Meteor.users.findOne {_id: doc.admin_id}
            doc["has_disable_btn"] = doc.status == "enabled"
            doc["origin_desc"] = null
            if doc["from_location"] and doc["to_location"]
                doc["origin_desc"] = "This method is only valid if items are shipped from <u>#{doc["from_location"]}</u> to <u>#{doc["to_location"]}</u>."
            else if doc["from_location"]
                doc["origin_desc"] = "This method is only valid if items are shipped from <u>#{doc["from_location"]}</u>."
            else if doc["to_location"]
                doc["origin_desc"] = "This method is only valid if items are shipped to <u>#{doc["from_location"]}</u>."
            doc
    }

Template.shipping_all.events =
    "click [data-expand]": (evt) ->
        elem = $(evt.target).parents("[data-expand]")[0]
        id = $(elem).attr("data-expand")
        $("[data-expanded]").addClass "hidden"
        $("[data-expanded=#{id}]").removeClass("hidden")

    "click .disable-btn": (evt) ->
        shipping_id = $(evt.target).parents("[data-expanded]").attr("data-expanded")
        ShippingRule.update {_id: new Meteor.Collection.ObjectID(shipping_id)}, {
            $set:
                {status: "disabled"}
        }
        flashAlert "Shipping method disabled.", ""

    "click .enable-btn": (evt) ->
        shipping_id = $(evt.target).parents("[data-expanded]").attr("data-expanded")
        ShippingRule.update {_id: new Meteor.Collection.ObjectID(shipping_id)}, {
            $set:
                {status: "enabled"}
        }
        flashAlert "Shipping method enabled.", ""

    "click .delete-btn": (evt) ->
        shipping_method_id = $(evt.target).parents("[data-expanded]").attr("data-expanded")
        bootbox.confirm "Confirm delete?", (res) ->
            if res
                ShippingRule.remove {_id: new Meteor.Collection.ObjectID(shipping_method_id)}

#-- shipping compose --#

Template.shipping_compose.rendered = ->
    $("#shipping-compose-form").off "submit"
    $("#shipping-compose-form").on "submit", (evt) ->
        evt.preventDefault()
        createShipping()

Template.shipping_compose.events =
    "click .submit-btn": (evt) ->
        evt.preventDefault()
        createShipping()


#-- helper --#

getPageNo = ->
    slugs = Session.get SHIPPING_SESSION.SUBURL
    if not slugs?
        return 1

    slugs = slugs.split("/")
    slugs = _.filter slugs, (s) ->
        s != ""
    if slugs.length >= 1
        return parseInt slugs[0]
    return 1

createShipping = ->
    if $("#shipping-compose-form").parsley "validate"
        data_lis = $("#shipping-compose-form").serializeArray()
        dic = {}
        for entry in data_lis
            dic[entry.name] = entry.value

        Meteor.call "new_shipping_method", dic, ->
            Router.navigate "/shipping", true

getPage = () ->
    slugs = Session.get SHIPPING_SESSION.SUBURL
    if not slugs?
        return SHIPPING_TEMPLATE.MAIN

    slugs = slugs.split("/")
    slugs = _.filter slugs, (s) ->
        s != ""
    if slugs.length >= 1
        if slugs[0] == SHIPPING_PAGE.COMPOSE
            return SHIPPING_TEMPLATE.NEW

    SHIPPING_TEMPLATE.MAIN