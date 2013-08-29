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