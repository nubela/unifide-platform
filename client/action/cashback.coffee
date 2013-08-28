@CASHBACK_SESSION =
    SUBURL: "CBSubUrl"

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


#-- cashback --#

Template.cashback.view = ->
    Template[getCashbackTemplate()]()

Template.cashback.rendered = ->
    scrollTop()

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

#-- util --#

createCashback = (make_active=false) ->
    if $("#cashback-compose-form").parsley("validate")
        dic = {
            name: $("#name").val
            description: $("#description").val()
            perc: $("#perc").val()
            min_spending: $("#min-spending").val()
            make_active: make_active
        }
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