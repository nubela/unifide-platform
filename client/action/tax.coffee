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

Template.tax.rendered = ->
    scrollTop()

Template.tax.view = ->
    Template[getPage()]()

#-- tax_all --#

Template.tax_all.created = ->
    Meteor.subscribe "all_admins"
    Meteor.subscribe "all_taxes"

Template.tax_all.rendered = ->
    null

Template.tax_all.current_tax = ->
    TaxRule.findOne
        status: "enabled"

Template.tax_all.taxes = ->
    page_no_0_idx = getPageNo() - 1
    TaxRule.find {}, {
        limit: ITEMS_PER_PAGE
        skip: page_no_0_idx * ITEMS_PER_PAGE
        sort:
            modification_timestamp_utc: -1
        transform: (doc) ->
            doc["id"] = doc._id.valueOf()
            doc["admin"] = Meteor.users.findOne {_id: doc.admin_id}
            doc["has_description"] = doc.description.length > 0
            doc["has_disable_btn"] = doc.status == "enabled"
            doc
    }

Template.tax_all.events =
    "click [data-expand]": (evt) ->
        elem = $(evt.target).parents("[data-expand]")[0]
        id = $(elem).attr("data-expand")
        $("[data-expanded]").addClass "hidden"
        $("[data-expanded=#{id}]").removeClass("hidden")

    "click .disable-btn": (evt) ->
        tax_id = $(evt.target).parents("[data-expanded]").attr("data-expanded")
        TaxRule.update {_id: new Meteor.Collection.ObjectID(tax_id)}, {
            $set:
                {status: "disabled"}
        }
        flashAlert "Tax disabled.", ""

    "click .enable-btn": (evt) ->
        tax_id = $(evt.target).parents("[data-expanded]").attr("data-expanded")
        TaxRule.update {_id: new Meteor.Collection.ObjectID(tax_id)}, {
            $set:
                {status: "enabled"}
        }
        flashAlert "Tax enabled.", ""

    "click .delete-btn": (evt) ->
        tax_id = $(evt.target).parents("[data-expanded]").attr("data-expanded")
        bootbox.confirm "Confirm delete?", (res) ->
            if res
                TaxRule.remove {_id: new Meteor.Collection.ObjectID(tax_id)}

Template.tax_all.current_page = ->
    getPageNo()

Template.tax_all.next_page_url = ->
    page_no = getPageNo()
    next_page = page_no + 1
    return "/tax/#{next_page}"

Template.tax_all.prev_page_url = ->
    page_no = getPageNo()
    prev_page = page_no - 1
    return "/tax/#{prev_page}"

Template.tax_all.has_next = ->
    total_items = TaxRule.find({}).count()
    total_pages = Math.ceil(total_items / ITEMS_PER_PAGE)
    getPageNo() < total_pages

Template.tax_all.has_prev = ->
    getPageNo() >= 2

#-- tax_compose --#

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

getPageNo = ->
    slugs = Session.get TAX_SESSION.SUBURL
    if not slugs?
        return 1

    slugs = slugs.split("/")
    slugs = _.filter slugs, (s) ->
        s != ""
    if slugs.length >= 1
        return parseInt slugs[0]
    return 1

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