# Add a record for brand mapping on new user registration
Accounts.onCreateUser (options, user) ->
    result = Meteor.http.put(BACKEND_URL + "account/user/", {params: {user_id: user._id}})
    if result.statusCode != 200
        console.log result.error
    user