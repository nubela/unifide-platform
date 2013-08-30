@USER_SESSION =
    SUBURL: "USERSubUrl"

@USER_TEMPLATE =
    MAIN: "user_all"
    NEW: "user_compose"

@USER_PAGE =
    MAIN: "all"
    COMPOSE: "new"

ITEMS_PER_PAGE = 20

#-- tax --#

Template.user.rendered = ->
    scrollTop()

Template.user.view = ->
    Template[getPage()]()

#-- tax_compose --#

Template.user_compose.created = ->
    Meteor.subscribe "all_groups"

Template.user_compose.groups = ->
    Group.find({}, {sort: {name: 1}})

Template.user_compose.events =
    "submit #user-compose-form": (evt) ->
        evt.preventDefault()
        createUser()

    "click .save-btn": (evt) ->
        evt.preventDefault()
        createUser()


#-- helper --#

createUser = ->
    if $("#user-compose-form").parsley "validate"
        data_lis = $("#user-compose-form").serializeArray()
        dic = {}
        for entry in data_lis
            dic[entry.name] = entry.value
        dic.user_groups = JSON.stringify $("#user-groups").val()
        dic.status = $("#status").val()
        Meteor.call "new_user", dic, ->
            Router.navigate "/user"


getPage = () ->
    slugs = Session.get USER_SESSION.SUBURL
    if not slugs?
        return USER_TEMPLATE.MAIN

    slugs = slugs.split("/")
    slugs = _.filter slugs, (s) ->
        s != ""
    if slugs.length >= 1
        if slugs[0] == USER_PAGE.COMPOSE
            return USER_TEMPLATE.NEW

    USER_TEMPLATE.MAIN