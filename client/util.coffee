@MediaStorage =
    S3: "s3"
    LOCAL: "local"

@url_for = (media_obj) ->
    """
    Returns the backend url for a media object
    """
    if media_obj.storage == MediaStorage.S3
        return media_obj.url
    "#{BACKEND_URL}#{UPLOAD_RELATIVE_ENDPOINT}/#{media_obj.file_name}"

@page_render = (obj) ->
    $(obj.firstNode).css({'opacity': 0})
    $(obj.firstNode).css({'position': 'relative', 'left': 100})
    $(obj.firstNode).animate({'opacity': 1, 'left': '0'}, 100)

@scrollTop = ->
    $("html, body").animate({ scrollTop: 0 }, "fast")


@newAlert = (title, description, dismissable = true) ->
    alert = $(".alert-sample").clone().removeClass("hidden").removeClass("alert-sample")
    if not dismissable
        $(alert).find(".container-alert-close").remove()
    else
        $(alert).find(".loading-gif").remove()

    $(alert).find(".alert-title").text(title)
    $(alert).find(".alert-desc").text(description)
    $(".alert-container").prepend(alert)
    alert


@flashAlert = (title, description, dismissable = true) ->
    new_alert = newAlert(title, description, dismissable)
    setTimeout (->
        $(new_alert).remove()
    ), 4000


@getContainer = (container_id) ->
    ###
    Returns the container of the item
    Requisites: all_containers must be subscribed
    ###
    ITMChildCategories.findOne({_id: container_id})


@getItem = (item_id) ->
    ###
    Returns the item_obj and container object of the item
    Requisites: all_containers and all_items must be subscribed
    ###
    item_obj = ITMItems.findOne({_id: item_id})
    console.log item_id
    item_obj.container = getContainer(item_obj.container_id)
    item_obj


@isNumber = (n) ->
    not isNaN(parseFloat(n)) and isFinite(n)


@getProfileSettings = (key) ->
    user = Meteor.user()
    if "profile" of user
        return user.profile[key]
    return null

@setProfileSettings = (key, value) ->
    set_dic = {}
    set_dic["profile.#{key}"] = value
    Meteor.users.update {
        _id: Meteor.userId()
    }, {
        $set: set_dic
    }