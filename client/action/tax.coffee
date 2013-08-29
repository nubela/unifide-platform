@TAX_SESSION =
    SUBURL: "TAXSubUrl"

@TAX_TEMPLATE =
    MAIN: "tax_all"
    NEW: "tax_compose"

@TAX_PAGE =
    MAIN: "all"
    COMPOSE: "new"

ITEMS_PER_PAGE = 20

#-- tax --#

Template.tax.created = ->
    scrollTop()

Template.tax.view = ->
    Template[getPage()]()

#-- tax_compose --#

Template.tax_compose.created = ->
    null

Template.tax_compose.rendered = ->
    $("#tax-compose-form").off "submit"
    $("#tax-compose-form").on "submit", (evt) ->
        evt.preventDefault()
        createTax()

Template.tax_compose.events =
    "click .save-active-btn": (evt) ->
        evt.preventDefault()
        createTax true

    "click .save-btn": (evt) ->
        evt.preventDefault()
        createTax()


#-- helper --#

createTax = (make_active = false) ->
    if $("#tax-compose-form").parsley "validate"
        data_lis = $("#tax-compose-form").serializeArray()
        dic = {}
        for entry in data_lis
            dic[entry.name] = entry.value
        dic.make_active = make_active
        Meteor.call "new_tax", dic, ->
            Router.navigate "/taxes", true


getPage = () ->
    slugs = Session.get TAX_SESSION.SUBURL
    if not slugs?
        return TAX_TEMPLATE.MAIN

    slugs = slugs.split("/")
    slugs = _.filter slugs, (s) ->
        s != ""
    if slugs.length >= 1
        if slugs[0] == TAX_PAGE.COMPOSE
            return TAX_TEMPLATE.NEW

    TAX_TEMPLATE.MAIN