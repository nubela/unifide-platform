get_biz_info = ->
  @unblock()
  resp = Meteor.http.get(BACKEND_URL + "business/info/")
  JSON.parse resp.content

serialize = (obj) ->
    str = []
    for p of obj
        if obj.hasOwnProperty(p)
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]))
    str.join("&")

put_brand_mention_keyword = (keyword) ->
    @unblock()
    Meteor.http.put BACKEND_URL + "brand_mention/keyword/",
        params:
            keyword: keyword

del_brand_mention_keyword = (keyword) ->
    @unblock()
    Meteor.http.del BACKEND_URL + "brand_mention/keyword/?" + serialize(keyword: keyword)

get_child_containers_and_items = (path_lis) ->
    @unblock()
    resp = Meteor.http.get(BACKEND_URL + "container+item/?" + serialize(path_lis: JSON.stringify(path_lis)))
    JSON.parse resp.content

put_container = (path_lis, description) ->
    @unblock()
    Meteor.http.put BACKEND_URL + "container/",
        params:
            path_lis: JSON.stringify(path_lis)
            description: description

del_item = (item_id) ->
    @unblock()
    Meteor.http.del BACKEND_URL + "item/?" + serialize(item_id: item_id)

del_item = (item_id) ->
    @unblock()
    Meteor.http.del BACKEND_URL + "item/?" + serialize(item_id: item_id)

get_all_orders = ->
    @unblock()
    resp = Meteor.http.get(BACKEND_URL + "order/")
    JSON.parse resp.content

del_container = (container_id) ->
    @unblock()
    Meteor.http.del BACKEND_URL + "container/?" + serialize(container_id: container_id)

get_facebook_auth_url = (p, b) ->
    @unblock()
    result = Meteor.http.get(BACKEND_URL + "social_connect/facebook/auth/",
        params:
            platform: p
            brand_name: b
    )
    if result.statusCode isnt 200
        return
    else
        result.data.auth_url

connect_facebook_auth = (c, brand_name) ->
    @unblock()
    result = Meteor.http.put(BACKEND_URL + "social_connect/facebook/",
        params:
            user_id: @userId
            code: c
            brand_name: brand_name
    )
    console.log result.error  if result.statusCode isnt 200

get_facebook_pages = (brand_name) ->
    @unblock()
    result = Meteor.http.get(BACKEND_URL + "social_connect/facebook/page/",
        params:
            user_id: @userId
            brand_name: brand_name
    )
    if result.statusCode isnt 200
        console.log result.error
        return
    else
        result.data.page_list

put_facebook_page = (brand_name, page_id) ->
    @unblock()
    result = Meteor.http.put(BACKEND_URL + "social_connect/facebook/page/",
        params:
            user_id: @userId
            brand_name: brand_name
            page_id: page_id
    )
    console.log result.error  if result.statusCode isnt 200
    _FBPages.remove {}

del_facebook_user = (brand_name) ->
    @unblock()
    result = Meteor.http.del(BACKEND_URL + "social_connect/facebook/user/?user_id=" + @userId + "&brand_name=" + brand_name)
    console.log result.error  if result.statusCode isnt 200

del_facebook_page = (brand_name) ->
    @unblock()
    result = Meteor.http.del(BACKEND_URL + "social_connect/facebook/page/?user_id=" + @userId + "&brand_name=" + brand_name)
    console.log result.error  if result.statusCode isnt 200

get_twitter_auth_url = (platform, brand) ->
    @unblock()
    result = Meteor.http.get(BACKEND_URL + "social_connect/twitter/auth/",
        params:
            user_id: @userId
            brand_name: brand
    )
    if result.statusCode isnt 200
        console.log result.error
        return
    else
        result.data

connect_twitter_auth = (verifier, brand_name) ->
    @unblock()
    result = Meteor.http.put(BACKEND_URL + "social_connect/twitter/",
        params:
            user_id: @userId
            brand_name: brand_name
            oauth_verifier: verifier
    )
    console.log result.error  if result.statusCode isnt 200

del_twitter_user = (brand_name) ->
    @unblock()
    result = Meteor.http.del(BACKEND_URL + "social_connect/twitter/user/?user_id=" + @userId + "&brand_name=" + brand_name)
    console.log result.error  if result.statusCode isnt 200

get_foursquare_auth_url = (platform, brand) ->
    @unblock()
    result = Meteor.http.get(BACKEND_URL + "social_connect/foursquare/auth/",
        params:
            user_id: @userId
            brand_name: brand
    )
    if result.statusCode isnt 200
        console.log result.error
    else
        result.data.auth_url

connect_4sq_auth = (code, brand_name) ->
    @unblock()
    result = Meteor.http.put(BACKEND_URL + "social_connect/foursquare/",
        params:
            user_id: @userId
            brand_name: brand_name
            code: code
    )
    console.log result.error  if result.statusCode isnt 200

get_4sq_venues_managed = (brand_name) ->
    @unblock()
    result = Meteor.http.get(BACKEND_URL + "social_connect/foursquare/venue/managed/",
        params:
            user_id: @userId
            brand_name: brand_name
    )
    if result.statusCode isnt 200
        console.log result.error
    else
        result.data.venues

put_4sq_venue = (brand_name, venue_id) ->
    @unblock()
    result = Meteor.http.put(BACKEND_URL + "social_connect/foursquare/venue/",
        params:
            user_id: @userId
            brand_name: brand_name
            venue_id: venue_id
    )
    console.log result.error  if result.statusCode isnt 200

del_4sq_venue = (brand_name, venue_id) ->
    @unblock()
    result = Meteor.http.del(BACKEND_URL + "social_connect/foursquare/venue/?user_id=" + @userId + "&brand_name=" + brand_name + "&venue_id=" + venue_id)
    console.log result.error  if result.statusCode isnt 200

del_4sq_user = (brand_name) ->
    @unblock()
    result = Meteor.http.del(BACKEND_URL + "social_connect/foursquare/user/?user_id=" + @userId + "&brand_name=" + brand_name)
    console.log result.error  if result.statusCode isnt 200

http_api = (verb, url, args) ->
    @unblock()
    console.log args
    result = Meteor.http[verb](BACKEND_URL + url,
        params: args
    )
    if result.statusCode isnt 200
        console.log result.error
    else
        result

get_user_email = (username) ->
    @unblock()
    record = Meteor.users.findOne(username: username)
    record.emails[0].address

Meteor.methods
    get_all_orders: get_all_orders
    get_biz_info: get_biz_info
    put_container: put_container
    get_child_containers_and_items: get_child_containers_and_items
    put_brand_mention_keyword: put_brand_mention_keyword
    del_brand_mention_keyword: del_brand_mention_keyword
    del_item: del_item
    del_container: del_container
    get_platform_url: ->
        PLATFORM_URL
    get_facebook_auth_url: get_facebook_auth_url
    connect_facebook_auth: connect_facebook_auth
    get_facebook_pages: get_facebook_pages
    put_facebook_page: put_facebook_page
    del_facebook_user: del_facebook_user
    del_facebook_page: del_facebook_page
    get_twitter_auth_url: get_twitter_auth_url
    connect_twitter_auth: connect_twitter_auth
    del_twitter_user: del_twitter_user
    get_foursquare_auth_url: get_foursquare_auth_url
    connect_foursquare_auth: connect_4sq_auth
    get_foursquare_venues_managed: get_4sq_venues_managed
    put_foursquare_venue: put_4sq_venue
    del_foursquare_venue: del_4sq_venue
    del_foursquare_user: del_4sq_user
    http_api: http_api
    get_user_email: get_user_email
