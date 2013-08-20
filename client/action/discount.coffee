@DISCOUNT_SESSION =
    SUBURL: "DCSubUrl"

@DISCOUNT_TEMPLATE =
    MAIN: "discount_all"
    NEW: "discount_compose"

@DISCOUNT_PAGE =
    MAIN: "all"
    COMPOSE: "new"

#-- discount --#

Template.discount.rendered = ->
    scrollTop()

Template.discount.view = ->
    Template[getDiscountPage()]()

#-- helper --#

getDiscountPage = ->
    slugs = Session.get DISCOUNT_SESSION.SUBURL
    if not slugs?
        return DISCOUNT_TEMPLATE.MAIN

    slugs = slugs.split("/")
    slugs = _.filter slugs, (s) -> s != ""
    if slugs.length >= 1
        if slugs[0] == DISCOUNT_PAGE.COMPOSE
            return DISCOUNT_TEMPLATE.NEW

    DISCOUNT_TEMPLATE.MAIN