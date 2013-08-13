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