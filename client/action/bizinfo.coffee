BIZINFO_TEMPLATE =
    OVERVIEW: "bizinfo_overview"
    UPDATE: "bizinfo_update"

Template.bizinfo.view = ->
    if (Session.get "page_template") == BIZINFO_TEMPLATE.UPDATE
        Template[BIZINFO_TEMPLATE.UPDATE]()
    else
        Template[BIZINFO_TEMPLATE.OVERVIEW]()