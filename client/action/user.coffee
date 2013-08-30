@USER_SESSION =
    SUBURL: "USERSubUrl"
    USERNAME_FILTER: "USERFilterUsername"
    EMAIL_FILTER: "USERFilterEmail"

@USER_TEMPLATE =
    MAIN: "user_all"
    NEW: "user_compose"

@USER_PAGE =
    MAIN: "all"
    COMPOSE: "new"

ITEMS_PER_PAGE = 20

#-- user --#

Template.user.rendered = ->
    scrollTop()

Template.user.view = ->
    Template[getPage()]()

#-- user_all --#

Template.user_all.created = ->
    Meteor.subscribe "all_users"
    Session.set USER_SESSION.USERNAME_FILTER, ""
    Session.set USER_SESSION.EMAIL_FILTER, ""

Template.user_all.rendered = ->
    $("#filter-by-username").off "change paste keyup"
    $("#filter-by-username").on "change paste keyup", (evt) ->
        Session.set USER_SESSION.USERNAME_FILTER, $(evt.target).val()

    $("#filter-by-email").off "change paste keyup"
    $("#filter-by-email").on "change paste keyup", (evt) ->
        Session.set USER_SESSION.EMAIL_FILTER, $(evt.target).val()

Template.user_all.users = ->
    page_no_0_idx = getPageNo() - 1
    username_filter = Session.get USER_SESSION.USERNAME_FILTER
    email_filter = Session.get USER_SESSION.EMAIL_FILTER
    PlopUser.find {
        username:
            {$regex: ".*#{username_filter}.*", $options: 'i'}
        email:
            {$regex: ".*#{email_filter}.*", $options: 'i'}
    }, {
        limit: ITEMS_PER_PAGE
        skip: page_no_0_idx * ITEMS_PER_PAGE
        sort:
            modification_timestamp_utc: -1
        transform: (doc) ->
            doc["id"] = doc._id.valueOf()
            doc["full_name"] = "#{doc.first_name} #{doc.middle_name} #{doc.last_name}"
            doc
    }

Template.user_all.events =
    "click [data-expand]": (evt) ->
        elem = $(evt.target).parents("[data-expand]")[0]
        id = $(elem).attr("data-expand")
        $("[data-expanded]").addClass "hidden"
        $("[data-expanded=#{id}]").removeClass("hidden")

#-- user_compose --#

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

getPageNo = ->
    slugs = Session.get USER_SESSION.SUBURL
    if not slugs?
        return 1

    slugs = slugs.split("/")
    slugs = _.filter slugs, (s) ->
        s != ""
    if slugs.length >= 1
        return parseInt slugs[0]
    return 1

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