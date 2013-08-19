@MediaStorage =
    S3: "s3"
    LOCAL: "local"

@url_for = (media_obj) ->
    """
    Returns the backend url for a media object
    """
    if media_obj.storage == MediaStorage.S3
        return "#{CLOUDFRONT_URL}#{media_obj.file_name}"
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
        $(alert).find(".loading-gif").remove()
    else
        $(alert).find(".container-alert-close").remove()

    $(alert).find(".alert-title").text(title)
    $(alert).find(".alert-desc").text(description)
    $(".alert-container").prepend(alert)
    alert