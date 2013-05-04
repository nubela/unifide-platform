BIZINFO_TEMPLATE =
    OVERVIEW: "bizinfo_overview"
    UPDATE: "bizinfo_update"

Template.bizinfo.view = ->
    if (Session.get "page_template") == BIZINFO_TEMPLATE.UPDATE
        Template[BIZINFO_TEMPLATE.UPDATE]()
    else
        Template[BIZINFO_TEMPLATE.OVERVIEW]()

#--- bizinfo_overview template methods ---#

Template.bizinfo_overview.info = ->
    BIZINFObj.findOne()

#--- bizinfo_update template methods ---#

Template.bizinfo_update.info = ->
    BIZINFObj.findOne()

Template.bizinfo_update.redirect_url = ->
    url = PLATFORM_URL
    "#{ url }bizinfo"

Template.bizinfo_update.submit_url = ->
    url = BACKEND_URL
    "#{ url }business/info/"

Template.bizinfo_update.events =
    "click #bizinfo-submit-btn": (evt) ->
        evt.preventDefault()
        if $("#bizinfo-update-form").parsley "validate"
            $("#bizinfo-update-form").submit()
