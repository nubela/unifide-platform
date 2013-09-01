@CASHBACK_SESSION =
    SUBURL: "CBSubUrl"
    USER_CREDIT_USERNAME_FILTER: "CBUsernameFilter"

@CASHBACK_TEMPLATE =
    MAIN: "cashback_rules"
    COMPOSE_RULE: "cashback_compose"
    TRANSACTION_LOG: "cashback_transaction_log"
    USER_CREDIT_STORE: "cashback_user_values"

@CASHBACK_PAGE =
    MAIN: "rule"
    COMPOSE: "compose"
    TRANSACTION: "log"
    USER_CREDIT: "user-credit"

ITEMS_PER_PAGE = 20

#-- cashback --#

Template.cashback.view = ->
    Template[getCashbackTemplate()]()

Template.cashback.rendered = ->
    scrollTop()

#-- cashback_rules --#

Template.cashback_rules.created = ->
    Meteor.subscribe "all_admins"
    Meteor.subscribe "all_cashbacks"

Template.cashback_rules.rendered = ->
    null

Template.cashback_rules.active_rule = ->
    Cashback.findOne {
        status: "enabled"
    }, {
        transform: (doc) ->
            last_mod = moment(doc.modification_timestamp_utc)
            doc["id"] = doc._id.valueOf()
            doc["quick_desc"] = "#{doc.cashback_percentage}% cashback with a minimum spending of $#{doc.total_minimum_spending}"
            doc["last_mod_date"] = last_mod.format('MMMM Do YYYY')
            doc["admin"] = Meteor.users.findOne {_id: doc.admin_id}
            doc
    }

Template.cashback_rules.cashbacks = ->
    page_no_0_idx = getPageNo() - 1
    Cashback.find {},{
        limit: ITEMS_PER_PAGE
        skip: page_no_0_idx * ITEMS_PER_PAGE
        sort:
            modification_timestamp_utc: -1
        transform: (doc) ->
            last_mod = moment(doc.modification_timestamp_utc)
            doc["id"] = doc._id.valueOf()
            doc["quick_desc"] = "#{doc.cashback_percentage}% cashback with a minimum spending of $#{doc.total_minimum_spending}"
            doc["last_mod_date"] = last_mod.format('MMMM Do YYYY')
            doc["admin"] = Meteor.users.findOne {_id: doc.admin_id}
            doc["is_disabled"] = doc.status == "disabled"
            doc
    }

Template.cashback_rules.cashbacks_count = ->
    Cashback.find().count()

Template.cashback_rules.current_page = ->
    getPageNo()

Template.cashback_rules.next_page_url = ->
    page_no = getPageNo()
    next_page = page_no + 1
    return "/cashback/#{next_page}"

Template.cashback_rules.prev_page_url = ->
    page_no = getPageNo()
    prev_page = page_no - 1
    return "/cashback/#{prev_page}"

Template.cashback_rules.has_next = ->
    total_items = Cashback.find({}).count()
    total_pages = Math.ceil(total_items / ITEMS_PER_PAGE)
    getPageNo() < total_pages

Template.cashback_rules.has_prev = ->
    getPageNo() >= 2

Template.cashback_rules.events =
    "click #disable-active": (evt) ->
        bootbox.confirm "Confirm disable cashback?", (res) ->
            cashback_obj = Cashback.findOne {status: "enabled"}
            if res and cashback_obj?
                Cashback.update {
                    _id: cashback_obj._id
                }, {
                    $set: {
                        status: "disabled"
                    }
                }
                flashAlert "Cashback disabled", ""

    "click .obj-row": (evt) ->
        $(".expanded").addClass "hidden"
        $(evt.target).parents(".obj-row").find(".expanded").removeClass "hidden"

    "click .make-active": (evt) ->
        #disable active cashrule
        cashback_obj = Cashback.findOne {status: "enabled"}
        if cashback_obj?
            Cashback.update {
                _id: cashback_obj._id
            }, {
                $set: {
                    status: "disabled"
                }
            }

        #enable this cashback
        cashback_id = $(evt.target).parents(".obj-row").attr("data-cashback-id")
        Cashback.update {
            _id: new Meteor.Collection.ObjectID(cashback_id)
        }, {
            $set: {
                status: "enabled"
            }
        }
        flashAlert "Cashback enabled!", ""

#-- cashback_compose --#

Template.cashback_compose.rendered = ->
    $("#cashback-compose-form").off "submit"
    $("#cashback-compose-form").on "submit", (evt) ->
        evt.preventDefault()
        createCashback "true"

Template.cashback_compose.events =
    "click .save-active-btn": (evt) ->
        evt.preventDefault()
        createCashback "true"

    "click .save-btn": (evt) ->
        evt.preventDefault()
        createCashback()

#-- cashback_user_values --#

Template.cashback_user_values.created = ->
    Meteor.subscribe "all_users"
    Meteor.subscribe "all_credit_stores"
    Session.set CASHBACK_SESSION.USER_CREDIT_USERNAME_FILTER, ""

Template.cashback_user_values.rendered = ->
    $("#username-email-filter").off "change paste keyup"
    $("#username-email-filter").on "change paste keyup", (evt) ->
        Session.set CASHBACK_SESSION.USER_CREDIT_USERNAME_FILTER, $(evt.target).val()

Template.cashback_user_values.users = ->
    username_email_filter = $.trim Session.get CASHBACK_SESSION.USER_CREDIT_USERNAME_FILTER
    users = PlopUser.find({
        $or: [
            {username: {$regex: ".*#{username_email_filter}.*", $options: 'i'}},
            {email: {$regex: ".*#{username_email_filter}.*", $options: 'i'}}
        ]
    }).fetch()

    console.log {
        $or: [
            {username: {$regex: ".*#{username_email_filter}.*", $options: 'i'}},
            {email: {$regex: ".*#{username_email_filter}.*", $options: 'i'}}
        ]
    }

    user_id_lis = _.map users, (u) -> u._id

    dic = {}
    if username_email_filter.length > 0
        dic =
            user_id:
                $in: user_id_lis
    page_no_0_idx = getSecondaryPageNo() - 1
    CreditStore.find dic,{
        limit: ITEMS_PER_PAGE
        skip: page_no_0_idx * ITEMS_PER_PAGE
        sort:
            modification_timestamp_utc: -1
        transform: (doc) ->
            last_mod = moment(doc.modification_timestamp_utc)
            doc["last_mod_date"] = last_mod.format('MMMM Do YYYY')
            doc["id"] = doc._id.valueOf()
            doc["user"] = PlopUser.findOne {_id: doc.user_id}
            doc
    }

Template.cashback_user_values.events =
    "click .obj-row": (evt) ->
        $(".expanded").addClass "hidden"
        $(evt.target).parents(".obj-row").find(".expanded").removeClass "hidden"

    "click .adjust-btn": (evt) ->
        bootbox.prompt "What is a new credit which you will like to set for this user?", (res) ->
            if isNumber(res)
                inventory_id = $(evt.target).parents(".obj-row").attr "data-credit-id"
                CreditStore.update {
                    _id: new Meteor.Collection.ObjectID(inventory_id)
                }, {
                    $set:
                        total_credit: parseInt(res)
                }
                flashAlert "Updated new credit for user!", ""


Template.cashback_user_values.current_page = ->
    getSecondaryPageNo()

Template.cashback_user_values.next_page_url = ->
    page_no = getSecondaryPageNo()
    next_page = page_no + 1
    return "/cashback/user-credit/#{next_page}"

Template.cashback_user_values.prev_page_url = ->
    page_no = getSecondaryPageNo()
    prev_page = page_no - 1
    return "/cashback/user-credit/#{prev_page}"

Template.cashback_user_values.has_next = ->
    total_items = CreditStore.find({}).count()
    total_pages = Math.ceil(total_items / ITEMS_PER_PAGE)
    getSecondaryPageNo() < total_pages

Template.cashback_user_values.has_prev = ->
    getSecondaryPageNo() >= 2

#-- cashback_transaction_log --#

Template.cashback_transaction_log.created = ->
    Meteor.subscribe "all_users"
    Meteor.subscribe "all_admins"
    Meteor.subscribe "all_credit_log"

Template.cashback_transaction_log.logs = ->
    page_no_0_idx = getSecondaryPageNo() - 1
    CreditLog.find {},{
        limit: ITEMS_PER_PAGE
        skip: page_no_0_idx * ITEMS_PER_PAGE
        sort:
            modification_timestamp_utc: -1
        transform: (doc) ->
            last_mod = moment(doc.modification_timestamp_utc)
            doc["last_mod_date"] = last_mod.format('MMMM Do YYYY')
            doc["id"] = doc._id.valueOf()
            doc["user"] = PlopUser.findOne {_id: doc.user_id}
            doc["admin"] = Meteor.users.findOne {_id: doc.admin_id}
            doc["admin"] = Meteor.users.findOne {_id: doc.admin_id}
            doc
    }

Template.cashback_transaction_log.current_page = ->
    getSecondaryPageNo()

Template.cashback_transaction_log.next_page_url = ->
    page_no = getSecondaryPageNo()
    next_page = page_no + 1
    return "/cashback/log/#{next_page}"

Template.cashback_transaction_log.prev_page_url = ->
    page_no = getSecondaryPageNo()
    prev_page = page_no - 1
    return "/cashback/log/#{prev_page}"

Template.cashback_transaction_log.has_next = ->
    total_items = CreditLog.find({}).count()
    total_pages = Math.ceil(total_items / ITEMS_PER_PAGE)
    getSecondaryPageNo() < total_pages

Template.cashback_transaction_log.has_prev = ->
    getSecondaryPageNo() >= 2

#-- util --#

getSecondaryPageNo = ->
    slugs = Session.get CASHBACK_SESSION.SUBURL
    if not slugs?
        return 1

    slugs = slugs.split("/")
    slugs = _.filter slugs, (s) ->
        s != ""
    if slugs.length >= 2
        return parseInt slugs[1]
    return 1

getPageNo = ->
    slugs = Session.get CASHBACK_SESSION.SUBURL
    if not slugs?
        return 1

    slugs = slugs.split("/")
    slugs = _.filter slugs, (s) ->
        s != ""
    if slugs.length >= 1
        return parseInt slugs[0]
    return 1

createCashback = (make_active=false) ->
    if $("#cashback-compose-form").parsley("validate")
        dic = {
            name: $("#name").val()
            description: $("#description").val()
            perc: $("#perc").val()
            min_spending: $("#min-spending").val()
            make_active: make_active
        }
        console.log dic
        Meteor.call "new_cashback", dic, ->
            Router.navigate "/cashback", true
            flashAlert "Cashback created!", ""

getCashbackTemplate = ->
    slugs = (Session.get CASHBACK_SESSION.SUBURL)
    if not slugs?
        return CASHBACK_TEMPLATE.MAIN

    slugs = slugs.split("/")
    slugs = _.filter slugs, (s) -> s != ""
    if slugs.length >= 1
        if slugs[0] == CASHBACK_PAGE.COMPOSE
            return CASHBACK_TEMPLATE.COMPOSE_RULE
        else if slugs[0] == CASHBACK_PAGE.TRANSACTION
            return CASHBACK_TEMPLATE.TRANSACTION_LOG
        else if slugs[0] ==  CASHBACK_PAGE.USER_CREDIT
            return CASHBACK_TEMPLATE.USER_CREDIT_STORE

    CASHBACK_TEMPLATE.MAIN