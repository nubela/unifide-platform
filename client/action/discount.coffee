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

#-- discount_compose --#

Template.discount_compose.rendered = ->
    bindFormElements()
    $("#discount-compose-form").submit (evt) ->
        evt.preventDefault()
        createDiscount()


Template.discount_compose.events =
    "click #save-discount-btn": ->
        $("#discount-compose-form").submit()

#-- helper --#

getDiscountPage = ->
    slugs = Session.get DISCOUNT_SESSION.SUBURL
    if not slugs?
        return DISCOUNT_TEMPLATE.MAIN

    slugs = slugs.split("/")
    slugs = _.filter slugs, (s) ->
        s != ""
    if slugs.length >= 1
        if slugs[0] == DISCOUNT_PAGE.COMPOSE
            return DISCOUNT_TEMPLATE.NEW

    DISCOUNT_TEMPLATE.MAIN


bindFormElements = ->
    #toggle visible form elements on different #applicable-on selections
    $("#applicable-on").change ->
        $("#discount-select-container").addClass("hidden")
        $("#discount-container-id").removeAttr("data-required")
        $("#discount-select-item").addClass("hidden")
        $("#discount-item-id").removeAttr("data-required")
        if $(this).val() == "item"
            $("#discount-select-item").removeClass("hidden")
            $("#discount-item-id").attr("data-required", "true")
        else if $(this).val() == "container"
            $("#discount-select-container").removeClass("hidden")
            $("#discount-container-id").attr("data-required", "true")

    $("#discount-lifetime-type").change ->
        $(".date-selectors").addClass("hidden")
        if $(this).val() == "duration"
            $(".date-selectors").removeClass("hidden")

    $(".date-selectors").datetimepicker
        language: 'en'

    $("#discount-item-id").focus ->
        searchItemId (success, id, name) =>
            if success
                $(this).val(name)
                $(this).attr("data-item-id", id)

    $("#discount-container-id").focus ->
        searchContainerId (success, id, name) =>
            if success
                $(this).val(name)
                $(this).attr("data-container-id", id)


createDiscount = ->
    if $("#discount-compose-form").parsley("validate")
        null